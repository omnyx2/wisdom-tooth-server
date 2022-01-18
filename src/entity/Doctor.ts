import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Hospital } from "./Hospital";

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45 })
  name: string;

  @PrimaryColumn({ length: 45 })
  email: string;

  @PrimaryColumn({ length: 45 })
  phone: string;

  @Column({ length: 200 })
  password: string;

  @Column({ length: 300, nullable: true })
  access_token: string;
  
  @Column({ length: 300, nullable: true })
  refresh_token: string;

  @Column({ length: 45 })
  belong: string;

  @Column({ length: 45 })
  position: string;

  @Column({ length: 45 })
  type: string;

  @Column({ length: 45 })
  profile_image: string;

  @Column({ length: 45 })
  address: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.doctors,  {
    onDelete: 'CASCADE',
  })
  public hospital: Hospital;
}
