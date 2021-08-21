import "reflect-metadata";
import * as express from "express";
import * as request from 'request';
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";
import { Doctor } from "./entity/Doctor";
import { Request } from "./entity/Request";

var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
import {  asyncBcryptPassword, ensureAuthorized, hasValidToken,} from './lib/authLib'

import { DoctorObj, RequestObj } from './interfaces'
import { runInNewContext } from "vm";


createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "lyuhyeonseog",
    password: "",
    database: "testDB",
    entities: [
        // Photo,
	    Doctor,
	    Request
    ],
    synchronize: true,
}).then(async connection => {
    
    const ServerBasicConfig = {
        port: 80
    }
    // create and setup express app
    const app = express();
    app.use(express.json());
    // app.use(bodyParser.urlencoded({ extended: true }));
    // app.use(bodyParser.json());
    // app.use(morgan("dev")); // 모든 요청을 console에 기록
    // app.use(methodOverride()); // DELETE, PUT method 사용
    app.use(function(req, res, next) {
        //모든 도메인의 요청을 허용하지 않으면 웹브라우저에서 CORS 에러를 발생시킨다.
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });

    console.log(`turning on server on : ${ServerBasicConfig.port}`);
    
    // sign in link
    app.post('/auth', async function(req, res, next) {
        // 요청으로 부터 데이터 얻기
        const { phone, password } = req.body;
    
        // 데이터 베이스에서 데이터 가져오기 
        const doctorRepository = connection.getRepository(Doctor)
        const savedDoctorUser = await doctorRepository.findOne({phone: phone})
         
        // 요청 데이터의 유효성 검사, 유저 존재 확인
        try {
            if( savedDoctorUser === undefined) {
                res.setHeader("Content-Type", "application/json");
                res.send("wrong phone number");   
            } else {
                
                // 요청 데이터의 유효성 검사, 비밀번호 검증 확인
                const hashedPassword = savedDoctorUser.password
                const result = await bcrypt.compare(password, hashedPassword)
                
                console.log("pass", password, hashedPassword)
                console.log(result)

                // token 생성, 분리할 것
                if( result ) {
                    let token = jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + (60 * 60),
                        data: `${phone}:${hashedPassword}`
                    }, 'secret');

                    //token 생성시 데이터 베이스에 저장
                    savedDoctorUser.token = token;
                    await doctorRepository.save(savedDoctorUser);
                    
                    // 토큰 응답 데이터에 담아 전달
                    res.setHeader("Content-Type", "application/json");
                    console.log(token);
                    res.send(token);

                }
            
            }
        } catch (err){
            console.log(err)
        }

        /* 
            curl \
                -X POST http://localhost:80/auth \
                -H "Content-Type: application/json" \
                -d '{
                    "phone": "01073343551",
                    "password": "hi" 
                }'
        */
    });
   
    // 판비 서버로 부터 데이터 전송하기 실행
    app.post('/request', async function(req, res, next) {
        console.log(req.body);
        const requestObj: RequestObj =  req.body;
        const timestamp =  new Date().getTime();

        let request = new Request();
              
        request.requester =          requestObj.requester;
        request.responder =          requestObj.responder;
        request.status =             "접수대기";
        request.patient_name =       requestObj.patient_name;
        request.patient_chartid =    requestObj.patient_chartid;
        request.appointment_status = "접수대기";
        request.appointment_date =   requestObj.appointment_date; // nullable
        request.questionaire =       requestObj.questionaire;
        request.patient_phone =      requestObj.patient_phone;
        request.patient_ssn =        requestObj.patient_ssn;
        request.request_date =       timestamp; //timestamp  
        request.requester_note =     requestObj.requester_note; // nullable
        request.responder_note =     requestObj.responder_note; // nullable
        request.patient_sex =        requestObj.patient_sex; 
        request.operator =           requestObj.operator; // 초기값
        request.img_url =            requestObj.img_url;

        console.log("patient has been saved");
        
        let requestRepository = connection.getRepository(Request);
        await requestRepository.save(request);

        res.send("done")

        /*
            curl \
                -X POST http://localhost:80/request \
                -H "Content-Type: application/json" \
                -H ""
                -d  '{
                        
                            "requester":          "김치과의원",
                            "responder":          "연세대학병원",
                            "status":             "접수대기",
                            "patient_name":       "조환자",
                            "patient_chartid":    "00039483244fede12",
                            "appointment_status": "접수완료",
                            "appointment_date":   "1995-12-17T03:24:00",
                            "questionaire":       "",
                            "patient_phone":      "01021232746",
                            "requester_note":     "아파보임 사랑니가 깊어서 수술 반드시 필요",
                            "responder_note":     "사랑니 수술중 블리딩이 많이 발생 염증 반응 안일어나게 조심할것",
                            "patient_sex":        "M",
                            "operator":               "김의원"
                        
                    }'

            curl \
              -X POST https://invisionlab.kr/login \
              -d '{
                {'id':'ai', 'password':'aiqub'}
              }'
        */
    })
    
    // make it need router

    const InfoRouter = express.Router();

    // 웹앱에서 환자 데이터 요청하기
    app.get('/request', ensureAuthorized, hasValidToken, async function( req, res) {

        let requestRepository = connection.getRepository(Request);
        let savedRequests = await requestRepository.find();
        
        // 판비 서버에서 세션을 받아서 이미지링크와 세션 전송
        const panviServerAuthData = { id:"API" , password: "invision!@#"}
        
        const sessionOfPanvi = await request.post({
            header: {},
            url: 'https://invisionlab.kr/login', // localhost
            body: panviServerAuthData,
            json: true, function(error, res, body) {
                console.log(res)
            }
        })
        console.log(savedRequests);
        try {
            res.setHeader
            res.send({
                params: savedRequests
            });

        } catch(err) {
          console.log("network err")
          console.log(err)
        }
        

        /*
            curl  \
             -X GET http://localhost:80/request \
                -H "Accept: application/json" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2Mjg0OTM2OTQsImRhdGEiOiIwMTA3MzM0MzU1MTokMmIkMDQkTm1YRzd2SXJOdmxVQi5JWmQublRhLjdsd0NqUkxTeTJYSHFuVVpFUER2NFR3VmxRdS9ZQ20iLCJpYXQiOjE2Mjg0OTAwOTR9.YorC8-E4-ky57TJ59YMtB-wQ-GCwJ8ieEOXb7KpX8p4
        */
    })

    app.get('/doctors/name', async function(req, res, next) {

        let doctorRepository = connection.getRepository(Doctor);
        let savedDoctors= await doctorRepository.find();
        
        let DoctorsName = []
        savedDoctors.forEach(element => {
            DoctorsName.push(element.name)
        })
        console.log(DoctorsName)

        res.send(DoctorsName)
        /*
            curl \
                -X GET http://localhost:80/doctors \
                -H "Content-Type: application/json"
        */
    })

    // sign up link

    
    app.post('/auth/signup', asyncBcryptPassword, async function(req, res, next) {
        asyncBcryptPassword
        const doctorValue: DoctorObj = req.body;
        let doctor = new Doctor();

        console.log(req.body)

        doctor.name =                doctorValue.name;
        // d암호화된 패스워드
        doctor.password =            req.body.password;
        doctor.belong =              doctorValue.belong;
        doctor.phone =               doctorValue.phone; // pk
        doctor.position =            doctorValue.position;
        doctor.type =                doctorValue.type;
        doctor.email =               doctorValue.email; // pk
        doctor.profile_image =       doctorValue.profile_image;
        doctor.address =             doctorValue.address;

        let doctorRepository = connection.getRepository(Doctor);
        let isExist= await doctorRepository.findOne({phone: doctorValue.phone});
      
        if( isExist === undefined ) {
            console.log("Doctor has been saved");
            await connection.manager.save(doctor);

            console.log(req.body);
            res.send("Thanks");
        } else {
            console.log(" Exist ")
            res.send("404");
        }

        /* curl로 가입
            curl \
                -X POST http://localhost:80/auth/signup \
                -H "Content-Type: application/json" \
                -d '{
                    "name": "동현",
                    "password": "hi",
                    "phone": "01073343551",
                    "belong":   "연세 대학 의료 병원",
                    "position": "책임의사",
                    "type" :    "??",
                    "email" :   "donghuenx2@gmail.com", 
                    "profile_image" :  "www.naver.com/png",
                    "address" : "서울특별시 신촌 에스큐브 S3"
            }'
            curl \
                -X POST http://localhost:80/auth/signup \
                -H "Content-Type: application/json" \
                -d '{
                    "name": "현석",
                    "password": "hi",
                    "phone": "01025902746",
                    "belong":   "연세 대학 의료 병원",
                    "position": "책임의사",
                    "type" :    "??",
                    "email" :   "omnyx2@gmail.com", 
                    "profile_image" :  "www.naver.com/png",
                    "address" : "서울특별시 신촌 에스큐브 S3"
            }'
        */
    })

    app.delete('/clear', function(req, res, next) {
       const where:string = req.body.clearWhere
       if( where == "doctor") {}
    })

    app.listen(ServerBasicConfig.port);

}).catch(error => console.log(error));
