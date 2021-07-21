import "reflect-metadata";
import * as express from "express";
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";
import { Doctor } from "./entity/Doctor";
import { Patient } from "./entity/Patient";


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
    
    // create and setup express app
    const app = express();
    app.use(express.json());

    
    let photoRepository = connection.getRepository(Photo);
    console.log("Photo has been cleared");
    let resetPhotho = await photoRepository.find();
    await photoRepository.save(resetPhotho);
    
    let photo = new Photo();

    photo.name = "hi"
    photo.description = "I am near polar bears";
    photo.filename = "warning.png";
    photo.views = 1;
    photo.isPublished = true;
    console.log("Photo has been saved");
    await connection.manager.save(photo);

    let doctor = new Doctor();

    doctor.name =                "김동현";
    doctor.password =            "1234";
    doctor.belong =              '연세 대학 의료 병원';
    doctor.position =            "책임의사";
    doctor.type =                "??";
    doctor.email =               "omnnyx2@gmail.com"; // pk
    doctor.profile_image =       "www.naver.com/png";
    doctor.address =             "서울특별시 신촌 에스큐브 S3"
    console.log("Doctor has been saved");
    await connection.manager.save(doctor);

    let patient = new Patient();
    
    patient.requester =          '김치과의원';
    patient.responder =          '연세대학병원';
    patient. status =            '접수대기';
    patient.patient_name =       '김환자';
    patient.patient_chartid =    "0003948984fede12";
    patient.appointment_status = "접수완료";
    patient.appointment_date =   "1995-12-17T03:24:00";
    patient.questionaire =       "";
    patient.patient_phone =      "01025902746";
    patient.request_date =       "1996-12-17T03:24:00";
    patient.requester_note =     "아파보임 사랑니가 깊어서 수술 반드시 필요";
    patient.responder_note =     "사랑니 수술중 블리딩이 많이 발생 염증 반응 안일어나게 조심할것";
    patient.patient_sex =        "M";
    patient.read =                "김의원";

    console.log("patient has been saved");
    await connection.manager.save(patient);

}).catch(error => console.log(error));
