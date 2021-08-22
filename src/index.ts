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
            url: 'http://invisionlab.kr/login', // localhost
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
            res.end();

        } catch(err) {
          console.log("network err")
          console.log(err)
        }
    })

    app.post('/patient/status',  async function( req, res) {

        let requestRepository = connection.getRepository(Request);
        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
       
        try {
            if(savedRequest.status === statusList[0]) {
                for(let i = 0; i < statusList.length; i++) {
                    if(savedRequest.status === statusList[i]) {
                        savedRequest.status = statusList[i+1]
                        break;
                    }
                }
                await requestRepository.save(savedRequest);
                res.send(savedRequest);
                res.end()

            } else if(savedRequest.status === statusList[1]) {
                if( savedRequest.appointment_date === undefined ) { throw "missing data"; } 
                if( savedRequest.operator === undefined ) { throw "missing data"; } 
                for(let i = 0; i < statusList.length; i++) {
                    if(savedRequest.status === statusList[i]) {
                        savedRequest.status = statusList[i+1]
                        break;
                    }
                }
                savedRequest.appointment_date = req.body.appointment_date;
                savedRequest.operator = req.body.operator
                savedRequest.appointment_status = "수술예약완료";
                await requestRepository.save(savedRequest);
                res.send(savedRequest);
                res.end()

            } else if (savedRequest.status === statusList[3])  {
                for(let i = 0; i < statusList.length; i++) {
                    if(savedRequest.status === statusList[i]) {
                        savedRequest.status = statusList[i+1]
                        break;
                    }
                }
                savedRequest.responder_note = req.body.responder_note === undefined ? "없음" : req.body.responder_note;
                savedRequest.appointment_status = "수술예약완료";
                await requestRepository.save(savedRequest);
                res.send(savedRequest);
                res.end()
    
            } else {
                res.send("where are you came from? I'll send you to a virues for ukkkkkkkkkk ;)")
                res.end()
            }
    
          res.end()

        } catch(err) {
            console.log(err)
        }
        
    })
    app.post('/patient/calendar', ensureAuthorized, hasValidToken, async function( req, res) {
      
    })
    app.post('/patient/status', ensureAuthorized, hasValidToken, async function( req, res) {
      
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
            
        */
    })

    app.delete('/clear', function(req, res, next) {
       const where:string = req.body.clearWhere
       if( where == "doctor") {}
    })

    app.listen(ServerBasicConfig.port);

}).catch(error => console.log(error));
