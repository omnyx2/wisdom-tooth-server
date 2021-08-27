import "reflect-metadata";
import * as express from "express";
import * as request from 'request';
import { createConnection } from "typeorm";
import { Doctor } from "./entity/Doctor";
import { Request } from "./entity/Request";
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
import {  asyncBcryptPassword, ensureAuthorized, hasValidToken } from './lib/authLib'

import { DoctorObj, RequestObj } from './interfaces'
import { nextTick } from "process";


createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "omnyx2",
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
            throw new Error("err!")
            next()
        }
    });
    app.post('/doctor', async function (req, res, next) {
        try{
            let doctorRepository = connection.getRepository(Doctor);
            let doctor = await doctorRepository.findOne({ token: req.body.token });
            delete doctor.password;
            delete doctor.token;

            console.log(doctor)
            res.send(doctor);
            res.end();

        } catch(err) {
            res.send("failed")
            console.log(err.message)
        }
    })
    // 판비 서버로 부터 데이터 전송하기 실행
    app.post('/request', async function(req, res, next) {
        console.log(req.body);
        const requestObj: RequestObj =  req.body;
        const timestamp =  new Date().getTime();

        let request = new Request();
              
        request.requester =          requestObj.requester;
        request.responder =          requestObj.responder;
        request.requester_phone =    requestObj.requester_phone;
        request.status =             "접수대기";
        request.patient_name =       requestObj.patient_name;
        request.patient_chartid =    requestObj.patient_chartid;
        request.appointment_status = "접수대기";
        request.appointment_date =   requestObj.appointment_date; // nullable
        request.questionnaire =      requestObj.questionnaire;
        request.patient_phone =      requestObj.patient_phone;
        request.patient_ssn =        requestObj.patient_ssn;
        request.request_date =       timestamp; //timestamp
        request.requester_address =  requestObj.requester_address;
        request.requester_note =     requestObj.requester_note; // nullable
        request.responder_note =     requestObj.responder_note; // nullable
        request.patient_sex =        requestObj.patient_sex; 
        request.operator =           requestObj.operator; // 초기값
        request.img_url =            requestObj.img_url;
        request.isDeleted =          false;

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
        let savedRequests = await requestRepository.find({ isDeleted: false});
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        savedRequests.sort((a: RequestObj,b: RequestObj) => (statusList.indexOf(a.status) - statusList.indexOf(b.status)))

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

    //status 상태관련 일괄처리
    app.post('/patient/status',  async function( req, res ) {

        let requestRepository = connection.getRepository(Request);

        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        
        try {
            //  접수 대기
            if(savedRequest.status === statusList[0]) {
                savedRequest.status = statusList[1]
                  
            // 최초의 수술 예약
            } else if(savedRequest.status === statusList[1]) {
                console.log(req.body)
                if( req.body.appointment_date !== null &&
                    req.body.operator !== null ) {
                    console.log("arrived?")
                    savedRequest.status = statusList[2]  
                    savedRequest.appointment_date = req.body.appointment_date;
                    savedRequest.operator = req.body.operator
                    
                } else { throw new Error("wrong operator"); } 

            // 수술 대기
            } else if( savedRequest.status === statusList[2]) {
                savedRequest.status = statusList[3]  
                savedRequest.responder_note = req.body.responder_note
            }
             else { throw new Error("wrong request status"); }

          await requestRepository.save(savedRequest);
          res.send(savedRequest);
          res.end();

        } catch(err) {
            res.send("failed");
            res.end();
            console.log(err.message);
        }
    })

    // 수술 날짜 변경하기
    app.post('/patient/change-operation',  async function( req, res ) {

        let requestRepository = connection.getRepository(Request);
        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        try{
            if(savedRequest.status === statusList[2]) {
                if( req.body.appointment_date !== null &&
                    req.body.operator !== null ) {
 
                    savedRequest.appointment_date = req.body.appointment_date;
                    savedRequest.operator = req.body.operator
                    
                } else { throw new Error("wrong operator"); } 
                
                await requestRepository.save(savedRequest);
                res.send(savedRequest);
                res.end();

            } else {
                    throw new Error("wrong request");
            }} catch(err) {
                res.send("failed")
                console.log(err.message)
            }
    })
    // 후처치 변경하기
    app.post('/patient/change-responder-note',  async function( req, res ) {
        let requestRepository = connection.getRepository(Request);
        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        try{
            if(savedRequest.status === statusList[3]) {
                    console.log("done")
                    savedRequest.responder_note = req.body.responder_note
                    await requestRepository.save(savedRequest);
                    res.send(savedRequest);
                    res.end();

            } else {
                throw new Error("wrong request");
            }

        } catch(err) {
            res.send("failed")
            console.log(err.message)
        }
    })

    // 예약 상태를 뒤로 돌리는 방법 
    app.post('/patient/down-grade-status',  async function( req, res ) {
        let requestRepository = connection.getRepository(Request);
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        let savedRequest = await requestRepository.findOne({ id: req.body.id });

        try{
            if(savedRequest.status === statusList[3]) {
                savedRequest.status = statusList[2];
                savedRequest.responder_note = null;
                savedRequest.appointment_status = null;

            } else if(savedRequest.status === statusList[2]) {
                
                savedRequest.status = statusList[1];
                savedRequest.appointment_date = null;
                savedRequest.operator = null;
                savedRequest.appointment_status = null;
                
            } else if(savedRequest.status === statusList[1]) {
                savedRequest.status = statusList[0];

            } else {
                throw new Error("wrong request");
            }

            await requestRepository.save(savedRequest);
            res.send(savedRequest);
            res.end();

        } catch(err) {
            res.send("failed")
            console.log(err.message)
        }
    })

      // 환자 데이터 초기화
    app.post('/patient/initialize-status',  async function( req, res ) {

        let requestRepository = connection.getRepository(Request);
        const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        console.log(req.body)
        try{
            savedRequest.status = statusList[0];
            savedRequest.responder_note = null;
            savedRequest.appointment_date = null;
            savedRequest.operator = null;

            await requestRepository.save(savedRequest);
            res.send(savedRequest);
            res.end();

        } catch(err) {
            res.send("failed")
            console.log(err.message)
        }
    })

    app.delete('/patient',  async function( req, res, next ) {
        let requestRepository = connection.getRepository(Request);
        console.log(req.body)
        let savedRequest = await requestRepository.findOne({ id: req.body.id });
        try {
            if( savedRequest !== undefined ) {
                savedRequest.isDeleted = true;
                await requestRepository.save(savedRequest);
                res.send('del');
                res.end()
            } else {
                throw new Error("Can't Find ID");
            }
        } catch(err) {
            res.send("failed to del")
            console.log(err);
            next()
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

    app.use((err, req, res, next) => {
        res.json({ message: err.message} )
    })

    app.listen(ServerBasicConfig.port);

}).catch(error => console.log(error));
