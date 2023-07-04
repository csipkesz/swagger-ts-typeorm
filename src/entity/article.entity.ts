import { MaxLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";
import { articleConfig } from "../config";
  
@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: articleConfig.maxLength.title })
    @MaxLength(articleConfig.maxLength.title, { message: 'Article title is too long!' })
    title!: string;

    @Column({ length: articleConfig.maxLength.description })
    @MaxLength(articleConfig.maxLength.description, { message: 'Article description is too long!' })
    description!: string;
}