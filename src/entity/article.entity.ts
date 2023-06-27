import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
  
@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    title!: string;

    @Column({ length: 5000 })
    description!: string;
}