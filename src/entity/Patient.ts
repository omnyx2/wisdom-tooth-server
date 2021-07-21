import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patient {

    @PrimaryGeneratedColumn()
    id: number;
 
    @Column({length: 45 })
    requester: string;

    @Column({length: 45 })
    responder: string;

    @Column({length: 45 })
    status: string;
    
    @Column({length: 45 })
    patient_name: string;
    
    @Column({length: 45 })
    patient_chartid: string;

    @Column({length: 45 })
    appointment_status: string;
    
    @Column({length: 45 })
    appointment_date: string;
    
    @Column({length: 45 })
    questionaire: string;
    
    @Column({length: 45 })
    patient_phone: string;
    
    @Column({length: 45 })
    request_date: string;
    
    @Column({length: 45 })
    requester_note: string;
    
    @Column({length: 45 })
    responder_note: string;
    
    @Column({length: 45 })
    patient_sex: string;
    
    @Column({length: 45 })
    read: string;
}
