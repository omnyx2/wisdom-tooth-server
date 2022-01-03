import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Request } from '../entity/Request';
import { RequestObj } from '../interfaces'

class PatientController {
  baseUrl =  '/patient'
  router = Router()
  
  constructor() {
    this.initializeRouter.bind(this)
    this.paitentStatut.bind(this)
    this.initializeRouter()
  }

  initializeRouter() {
    const router = Router();
    // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
    
    router
      .post('/status',  this.paitentStatut)
      .post('/change-operation', this.changeOperation)
      .post('/change-responder-note',this.changeResponderNote)
      .post('/down-grade-status', this.downGradeStatus)
      .post('/initialize-status', this.InitializeStatus)
      .delete('/', this.deletePatient)
      
      // .post('/delete', this.deleteaAccount)// wrap(this.login))
    
    this.router.use(this.baseUrl, router)

  }

  async paitentStatut( req, res ) {

    let requestRepository = getRepository(Request);

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
  }

  // 수술 날짜 변경하기
 async changeOperation ( req, res ) {

    let requestRepository =  getRepository(Request);
    let savedRequest = await requestRepository.findOne({ id: req.body.id });
    const statusList = ['접수대기', '예약대기', '수술대기', '수술완료' ];
    try{
        if(savedRequest.status !== statusList[3] || 
            savedRequest.status !== statusList[0] ) {
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
  }
  // 후처치 변경하기
  async changeResponderNote (req, res ) {
    let requestRepository =  getRepository(Request);
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
  }

  // 예약 상태를 뒤로 돌리는 방법 
 async downGradeStatus( req, res ) {
    let requestRepository =  getRepository(Request);
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
  }

  // 환자 데이터 초기화
  async InitializeStatus ( req, res ) {

    let requestRepository =  getRepository(Request);
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
  }

  async deletePatient ( req, res, next ) {
    let requestRepository =  getRepository(Request);
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
  }
}

export const patientController = new PatientController()