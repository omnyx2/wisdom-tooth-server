import { Router, Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Hospital } from "../entity/Hospital";
import { HospitalObj, ResponseSnippet } from "../interfaces";
import {
  ensureAuthorized,
  hasValidToken,
  asyncBcryptPassword,
  asyncBcryptPasswordRaw,
} from "../lib/authLib";
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

class HospitalController {
  baseUrl = "/hospital";
  router = Router();

  // teacherService = new TeacherService(new TeacherRepository);
  constructor() {
    this.hasPermission.bind(this);
    this.registHospital.bind(this);
    this.initializeRoutes.bind(this);
    this.initializeRoutes();
  }
  initializeRoutes() {
    const router = Router();
    // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
    router.get("/", (req, res, next) => {
      res.send("ho")
    })
    router.post("/regist", this.hasPermission, this.registHospital);
    this.router.use(this.baseUrl, router);
  }

  hasPermission = function (req, res, next) {
    if (req.body.MASTER_CODE === process.env.MASTER_CODE) {
      next();
    } else {
      console.log("HACKING_MASTER_CODE");
      setTimeout(async function () {
        await res.send("susseced");
      }, 50000);
    }
  };

  registHospital = async function (req, res, next) {
    const hospitalValue: HospitalObj = req.body;
    let hospital = new Hospital();

    hospital.hospital_name = req.body.hospital_name;
    let hospitalRepository = getRepository(Hospital);

    let isExistHospital = await hospitalRepository.findOne({
      hospital_name: req.body.hospital_name,
    });
   

    if (isExistHospital === undefined) {
      await hospitalRepository.save(hospital);
      const message = 'Successed to assert hospital';
      const snippet: ResponseSnippet = {
        status: 200,
        code: -1,
        message
      }
      console.log(message);
      res.send(snippet);

    } else {
      const message = 'Registed hospital';
      const snippet: ResponseSnippet = {
        status: 403,
        code: -1,
        message
      }
      console.warn(message);
      res.send(snippet);
  
    }

    /* curl로 가입
            
        */
  };
}

export const hospitalController = new HospitalController();
