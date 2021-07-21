import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";

@Entity()
export class Doctor {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 45 })
    name: string;

    @PrimaryColumn({length: 45 })
    email: string;

    @PrimaryColumn({length: 45 })
    phone: string;
    
    @Column({ length: 45 })
    password: string;
    
    @Column({ length: 45 })
    belong: string;
    
    @Column({ length: 45 })
    position: string;
    
    @Column({length: 45 })
    type: string;
    
    @Column({length: 45 })
    profile_image: string;
    
    @Column({length: 45 })
    address: string;    
}
