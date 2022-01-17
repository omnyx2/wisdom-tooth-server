import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Doctor } from "./Doctor";
import { Request } from "./Request";
// 의사들이 소속된 병원
@Entity()
export class Hospital {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  hospital_code: number;

  @Column({ length: 100 })
  hospital_name: string;

  @OneToMany(() => Doctor, (doctor) => doctor.hospital)
  doctors: Doctor[];

  @OneToMany(() => Request, (request) => request.hospital)
  requests: request[];
}
