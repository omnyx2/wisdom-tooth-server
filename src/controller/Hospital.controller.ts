import { Router, Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Hospital } from "../entity/Hospital";
import { HospitalObj } from "../interfaces";
import {
  ensureAuthorized,
  hasValidToken,
  asyncBcryptPassword,
  asyncBcryptPasswordRaw,
} from "../lib/authLib";
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

class hospitalController {
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

    console.log(req.body);
    hospital.hospital_name = req.body.hospital_name;
    let hospitalRepository = getRepository(Hospital);

    let isExist = await hospitalRepository.findOne({
      hospital_name: req.body.hospital_name,
    });

    if (isExist === undefined) {
      console.log("Doctor has been saved");
      await hospitalRepository.save(hospital);

      console.log(req.body);
      res.send("Hospital registed");
    } else {
      console.log("Existing Hospital");
      res.send("404");
    }

    /* curl로 가입
            
        */
  };
}

export const HospitalController = new hospitalController();
