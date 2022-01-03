import { Router } from 'express';
import { getRepository } from "typeorm";
import * as request from 'request';
import { Request } from "../entity/Request";
import { RequestObj } from '../interfaces'
import { ensureAuthorized, hasValidToken, asyncBcryptPassword, asyncBcryptPasswordRaw } from '../lib/authLib';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

class RequestController {
    baseUrl = '/request';
    router = Router();

    // teacherService = new TeacherService(new TeacherRepository);

    constructor() {
      this.saveRequest.bind(this);
      this.initializeRoutes.bind(this)
      this.initializeRoutes();
    }

    initializeRoutes() {
        const router = Router();
        // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
        router
          .post(this.baseUrl, this.saveRequest)
          .get(this.baseUrl, ensureAuthorized, hasValidToken, this.getRequests )
          // .post('/delete', this.deleteaAccount)// wrap(this.login))
        this.router.use(router)
    }

    async saveRequest (req, res, next) {
        const requestObj: RequestObj =  req.body;
        const timestamp =  new Date().getTime();
        let request: RequestObj;
              
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

        let requestRepository = getRepository(Request);
        await requestRepository.save(request);

        res.send("done")
    }
    

    // 웹앱에서 환자 데이터 요청하기
    async getRequests ( req, res ) {

        let requestRepository = getRepository(Request);
        let savedRequests = await requestRepository.find({ isDeleted: false });
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
    
    }

}

export const requestController = new RequestController()