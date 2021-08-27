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

const app = express.Router()

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
        console.log(req.body)
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
                let savedRequests = await requestRepository.find();
                res.send(savedRequests);
                res.end();
            
            // 수술 시작이나 업데이트가 동시에 가능 하긴해! 그만큼 추후에 수정이 필요해 유연한 만큼 빈틈이 많다.
            // 일단은 에러업는 기입이 기본적인 설정이니까 그렇게 간다.
            } else if(savedRequest.status === statusList[1]) {
                if( savedRequest.appointment_date === null ) { res.send('failed'); } 
                if( savedRequest.operator === null ) { res.send('failed'); } 
                // 최초의 수술 예약이라면 스테이터스를 갱신한다. 아니라면 굳이 할 필요는 없다.
                if( savedRequest.appointment_status !== "수술예약완료") {
                    for(let i = 0; i < statusList.length; i++) {
                        if(savedRequest.status === statusList[i]) {        
                            savedRequest.status = statusList[i+1]
                            break;
                }}}
                savedRequest.appointment_date = req.body.appointment_date;
                savedRequest.operator = req.body.operator
                savedRequest.appointment_status = "수술예약완료";
                await requestRepository.save(savedRequest);
                let savedRequests = await requestRepository.find();
                res.send(savedRequests);
                res.end();

            } else if (savedRequest.status === statusList[2])  {
                for(let i = 0; i < statusList.length; i++) {
                    if(savedRequest.status === statusList[i]) {
                        savedRequest.status = statusList[i+1]
                        break;
                    }
                }
                savedRequest.responder_note = req.body.responder_note === null ? "없음" : req.body.responder_note;
                savedRequest.appointment_status = "수술예약완료";
                await requestRepository.save(savedRequest);
                let savedRequests = await requestRepository.find();
                res.send(savedRequests);
                res.end();
    
            } else {
                res.send("where are you came from? I'll send you to a virues for ukkkkkkkkkk ;)");
                res.end();
            }
    
          res.end()

        } catch(err) {
            res.send("failed")
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
