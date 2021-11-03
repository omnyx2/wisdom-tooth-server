import { Router,  Request, Response, NextFunction } from 'express';
import { getRepository } from "typeorm";
import { Doctor } from "../entity/Doctor";
import { DoctorObj } from '../interfaces'
import { ensureAuthorized, hasValidToken, asyncBcryptPassword, asyncBcryptPasswordRaw } from '../lib/authLib';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

class DoctorsController {
    baseUrl = '/teacher';
    router = Router();

    // teacherService = new TeacherService(new TeacherRepository);

    constructor() {
      this.doctorsName.bind(this);
      this.initializeRoutes.bind(this)
      this.initializeRoutes();
    }

    initializeRoutes() {
        const router = Router();
        // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
        router
          .get('/doctors/name', ensureAuthorized, hasValidToken, this.doctorsName)
          // .post('/delete', this.deleteaAccount)// wrap(this.login))
        this.router.use(router)
    }

    doctorsName =  async function(req, res, next) {
        let doctorRepository = getRepository(Doctor);
        let savedDoctor = await doctorRepository.findOne({ token: req.body.token });
        try{
            if(savedDoctor != undefined ) {
                let doctorRepository = getRepository(Doctor);
                let savedDoctors= await doctorRepository.find(); 
            } else {

            }
                
        } catch(err) {
            console.error(err)
        }
        
        let savedDoctors= await doctorRepository.find();
        
        let DoctorsName = []
        savedDoctors.forEach(element => {
            DoctorsName.push(element.name)
        })
        
        res.send(DoctorsName)
    }
}

export const doctorsController = new DoctorsController()