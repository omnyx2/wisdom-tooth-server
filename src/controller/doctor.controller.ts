import { Router, Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Doctor } from "../entity/Doctor";
import { Hospital } from "../entity/Hospital";
import { DoctorObj, HospitalObj } from "../interfaces";
import {
  ensureAuthorized,
  hasValidToken,
  asyncBcryptPassword,
  asyncBcryptPasswordRaw,
} from "../lib/authLib";
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

class DoctorController {
  baseUrl = "/teacher";
  router = Router();

  // teacherService = new TeacherService(new TeacherRepository);

  constructor() {
    this.auth.bind(this);
    this.changePassword.bind(this);
    this.initializeRoutes.bind(this);
    this.initializeRoutes();
  }

  initializeRoutes() {
    const router = Router();
    // wrapper 패턴을 추가하고자 했으나 해당 단계에서 필요하지 않음
    router
      .get("", (req: Request, res: Response) => res.send("hi"))
      .post("/signup", asyncBcryptPassword, this.signUp)
      .post("/auth", this.auth) // wrap(this.signUp))
      .post("/doctor", this.doctorInfo)
      .post(
        "/change-password",
        ensureAuthorized,
        hasValidToken,
        this.changePassword
      ); // wrap(this.login))
    // .post('/delete', this.deleteaAccount)// wrap(this.login))
    this.router.use(router);
  }

  signUp = async function (req, res, next) {
    const doctorValue: DoctorObj = req.body;
    let doctor = new Doctor();

    console.log(req.body);

    doctor.name = doctorValue.name;
    // d암호화된 패스워드
    doctor.password = doctorValue.password;
    doctor.belong = doctorValue.belong;
    doctor.phone = doctorValue.phone; // pk
    doctor.position = doctorValue.position;
    doctor.type = doctorValue.type;
    doctor.email = doctorValue.email; // pk
    doctor.profile_image = doctorValue.profile_image;
    doctor.address = doctorValue.address;

    const hospitalRepository = getRepository(Hospital);
    const hospital = await hospitalRepository.findOne({
      hospital_name: doctorValue.hospital,
    });
    doctor.hospital = doctorValue.hospital;

    let doctorRepository = getRepository(Doctor);
    let isExist = await doctorRepository.findOne({ phone: doctorValue.phone });

    if (isExist === undefined) {
      console.log("Doctor has been saved");
      await doctorRepository.save(doctor);

      console.log(req.body);
      res.send("Thanks");
    } else {
      console.log(" Exist ");
      res.send("404");
    }

    /* curl로 가입
            
        */
  };

  // sign in link
  auth = async function (req, res, next) {
    // 요청으로 부터 데이터 얻기
    const { phone, password } = req.body;

    // 데이터 베이스에서 데이터 가져오기
    const doctorRepository = getRepository(Doctor);
    const savedDoctorUser = await doctorRepository.findOne({ phone: phone });

    // 요청 데이터의 유효성 검사, 유저 존재 확인
    try {
      if (savedDoctorUser === undefined) {
        res.setHeader("Content-Type", "application/json");
        res.send("wrong phone number");
      } else {
        // 요청 데이터의 유효성 검사, 비밀번호 검증 확인
        const hashedPassword = savedDoctorUser.password;
        const result = await bcrypt.compare(password, hashedPassword);

        console.log("pass", password, hashedPassword);
        console.log(result);

        // token 생성, 분리할 것
        if (result) {
          let token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              data: `${phone}:${hashedPassword}`,
            },
            "secret"
          );

          //token 생성시 데이터 베이스에 저장
          savedDoctorUser.token = token;
          await doctorRepository.save(savedDoctorUser);

          // 토큰 응답 데이터에 담아 전달
          res.setHeader("Content-Type", "application/json");
          console.log(token);
          res.send(token);
        } else {
          throw Error("wrong password");
        }
      }
    } catch (err) {
      console.log(err);
      next();
    }
  };

  changePassword = async function (req, res, next) {
    // 요청으로 부터 데이터 얻기
    const { phone, rePw, token } = req.body;

    // 데이터 베이스에서 데이터 가져오기
    const doctorRepository = getRepository(Doctor);
    const savedDoctorUser = await doctorRepository.findOne({ token: token });
    console.log("savedDoctor", savedDoctorUser);
    console.log(phone);
    // 요청 데이터의 유효성 검사, 유저 존재 확인
    try {
      if (savedDoctorUser.phone !== phone) {
        res.setHeader("Content-Type", "application/json");
        res.send("Who are you? reporting attacker ...");
      } else {
        // 요청 데이터의 유효성 검사, 비밀번호 검증 확인
        const result = savedDoctorUser.token === token ? true : false;
        const hashedRePassword = await asyncBcryptPasswordRaw(rePw);
        console.log(result);
        // token 생성, 분리할 것
        if (result) {
          let token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              data: `${phone}:${hashedRePassword}`,
            },
            "secret"
          );

          //token 생성시 데이터 베이스에 저장
          savedDoctorUser.token = token;
          savedDoctorUser.password = hashedRePassword;
          await doctorRepository.save(savedDoctorUser);

          // 토큰 응답 데이터에 담아 전달
          res.setHeader("Content-Type", "application/json");
          res.send(token);
        }
      }
    } catch (err) {
      console.log(err);
      throw new Error("err!");
      next();
    }
  };

  doctorInfo = async function (req, res, next) {
    try {
      let doctorRepository = getRepository(Doctor);
      let doctor = await doctorRepository.findOne({ token: req.body.token });
      delete doctor.password;
      delete doctor.token;

      console.log(doctor);
      res.send(doctor);
      res.end();
    } catch (err) {
      res.send("failed");
      console.log(err.message);
    }
  };
}

export const doctorController = new DoctorController();
