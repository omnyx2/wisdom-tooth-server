import { Router,  Request, Response, NextFunction } from 'express';
import { getRepository } from "typeorm";
import { Doctor } from "../entity/Doctor";
import { DoctorObj } from '../interfaces'
import { ensureAuthorized, hasValidToken, asyncBcryptPassword, asyncBcryptPasswordRaw } from '../lib/authLib';
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

class DoctorController {
    baseUrl = '/teacher';
    router = Router();

    // teacherService = new TeacherService(new TeacherRepository);

    constructor() {
      this.auth.bind(this);
      this.changePassword.bind(this);
      this.initializeRoutes.bind(this)
      this.initializeRoutes();
    }

    initializeRoutes() {
        const router = Router();
        // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
        router
          .get('',(req: Request, res: Response) => ( res.send('hi')))
          .post('/signup', asyncBcryptPassword, this.signUp)
          .post('/auth', this.auth)// wrap(this.signUp))
          .post('/doctor', this.doctorInfo)
          .post('/change-password', ensureAuthorized, hasValidToken, this.changePassword)// wrap(this.login))
          // .post('/delete', this.deleteaAccount)// wrap(this.login))
        this.router.use(router)
    }
}

export const doctorController = new DoctorController()