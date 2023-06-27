import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
import { tokenConfig } from "../config";
  
export const platformTypes = [ 'WEB', 'IOS', 'ANDROID' ];
type platformType = typeof platformTypes[number];


@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 128 })
    uuid!: string;

    @Column({ default: tokenConfig.maxRemainingToken })
    remaining!: number;

    @Column({ 
        type: "enum",
        enum: platformTypes,
    })
    platform!: platformType

    @CreateDateColumn()
    createdAt!: Date;
}