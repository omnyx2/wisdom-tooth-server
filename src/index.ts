import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";
import { Doctor } from "./entity/Doctor";
import { Patient } from "./entity/Patient";



var jwt = require('jsonwebtoken');
import secretObj from "./jwt/jwt";


import { DoctorObj } from './interfaces'


createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "lyuhyeonseog",
    password: "",
    database: "testDB",
    entities: [
        Photo,
	    Doctor,
	    Patient
    ],
    synchronize: true,
}).then(async connection => {
    
    const ServerBasicConfig = {
        port: 80,
    }
    const sign = () => {
      let token
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
    app.post('/auth', function(req, res, next) {
        
        /* curl로 로그인
            curl \
                -X POST http://localhost:80/auth \
                -H "Content-Type: application/json" \
                -d '{
                    "phone": "01025902746",
                    "password": "hi" 
                }'
        */
        const { phone, password } = req.body;

        let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 10),
            data: `${phone}:${password}`
          }, 'secret');

        console.log(token);
        res.setHeader("Content-Type", "application/json");
        res.send(token);
    });

    // sign up link
    app.post('/auth/signup', async function(req, res, next) {
        
        const doctorValue: DoctorObj = req.body

        /* curl로 가입
            curl \
                -X POST http://localhost:80/auth/signup \
                -H "Content-Type: application/json" \
                -d '{
                    "name": "현석",
                    "password": "hi",
                    "phone": "01025902746",
                    "belong":   "연세 대학 의료 병원",
                    "position": "책임의사",
                    "type" :    "??",
                    "email" :   "omnnyx2@gmail.com", 
                    "profile_image" :  "www.naver.com/png",
                    "address" : "서울특별시 신촌 에스큐브 S3"
            }'
        */

        let doctor = new Doctor();
        doctor.name =                doctorValue.name;
        doctor.password =            doctorValue.password;
        doctor.belong =              doctorValue.belong;
        doctor.phone =               doctorValue.phone; // pk
        doctor.position =            doctorValue.position;
        doctor.type =                doctorValue.type;
        doctor.email =               doctorValue.email; // pk
        doctor.profile_image =       doctorValue.profile_image;
        doctor.address =             doctorValue.address;

        console.log("Doctor has been saved");
        await connection.manager.save(doctor);

        console.log(req.body)
        res.send("Thanks")
    })
   
    app.delete('/clear', function(req, res, next) {
       const where:string = req.body.clearWhere

       if( where == "doctor") {}
    })
    

    app.listen(ServerBasicConfig.port);

    // let photoRepository = connection.getRepository(Photo);
    // console.log("Photo has been cleared");
    // let resetPhotho = await photoRepository.find();
    // await photoRepository.save(resetPhotho);
    
    // let photo = new Photo();

    // photo.name =                 "hi"
    // photo.description =          "I am near polar bears";
    // photo.filename =             "warning.png";
    // photo.views =                1;
    // photo.isPublished =          true;

    // console.log("Photo has been saved");
    // await connection.manager.save(photo);

    // let doctor = new Doctor();

    // doctor.name =                "김동현";
    // doctor.password =            "1234";
    // doctor.belong =              '연세 대학 의료 병원';
    // doctor.position =            "책임의사";
    // doctor.type =                "??";
    // doctor.email =               "omnnyx2@gmail.com"; // pk
    // doctor.profile_image =       "www.naver.com/png";
    // doctor.address =             "서울특별시 신촌 에스큐브 S3"
    // console.log("Doctor has been saved");
    // await connection.manager.save(doctor);

    // let patient = new Patient();
    
    // patient.requester =          '김치과의원';
    // patient.responder =          '연세대학병원';
    // patient. status =            '접수대기';
    // patient.patient_name =       '김환자';
    // patient.patient_chartid =    "0003948984fede12";
    // patient.appointment_status = "접수완료";
    // patient.appointment_date =   "1995-12-17T03:24:00";
    // patient.questionaire =       "";
    // patient.patient_phone =      "01025902746";
    // patient.request_date =       "1996-12-17T03:24:00";
    // patient.requester_note =     "아파보임 사랑니가 깊어서 수술 반드시 필요";
    // patient.responder_note =     "사랑니 수술중 블리딩이 많이 발생 염증 반응 안일어나게 조심할것";
    // patient.patient_sex =        "M";
    // patient.read =                "김의원";

    // console.log("patient has been saved");
    // await connection.manager.save(patient);

}).catch(error => console.log(error));
