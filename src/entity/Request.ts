import { Console } from "console";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Request {

    @PrimaryGeneratedColumn()
    id: number;
 
    @Column({length: 45 })
    requester: string;

    @Column({length: 45 }) // 여러 타입의 전화 010 2590 2746 010-2590-2746 010.2590.2746 regex -> 010 2590 2746
    requester_phone: string;

    @Column({length: 80 }) // 여러 타입의 전화 010 2590 2746 010-2590-2746 010.2590.2746 regex -> 010 2590 2746
    requester_address: string;

    @Column({length: 45 })
    responder: string;

    @Column({length: 45 }) // 4개의 상ㄷ태 접수대기, 예약대기, 수술대기, 수술완료
    status: string;
    
    @Column({length: 45 })
    patient_name: string;
    
    @Column({length: 45 }) 
    patient_chartid: string;

    @Column({length: 45 }) // 수술 예정인지 아닌지 
    appointment_status: string;
    
    @Column({length: 45, nullable: true  })  // 대학 병원과 환자 간의 날짜, 대학 병원에서 입력, 캘린더에서 프엔에서 받기
    appointment_date: string;
    
    @Column("text") // json, text로 
    questionnaire: string;
    
    @Column({length: 45 }) // 여러 타입의 전화 010 2590 2746 010-2590-2746 010.2590.2746 regex -> 010 2590 2746
    patient_phone: string;

    @Column({length: 15}) // '980706-15446757'
    patient_ssn: string;
    
    @Column("bigint") // 지역의원 에서 요청한 날짜, 서버에서 요청을 받은 날짜로 넣기
    request_date: number;
    
    @Column({length: 45, nullable: true  }) // 지역의원
    requester_note: string;
    
    @Column({length: 45, nullable: true  }) // 대학병원
    responder_note: string;
    
    @Column({length: 45 }) // "ㅇㅇ"
    patient_sex: string;
    
    @Column({ length: 45, nullable: true }) // 수술의사
    operator: string;

    @Column({ length: 200 }) //이미지는 url로 받아오기
    img_url: string;

    @Column()
    isDeleted: boolean;
}
