import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('missed-block')
export class MissedBlock {
  @PrimaryColumn()
  validator_address: string;

  @PrimaryColumn()
  height: number;

  @Column()
  timestamp: Date;
}