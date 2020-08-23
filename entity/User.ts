import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique,
} from 'typeorm';

export enum UserRole {
  admin = 'admin',
  user = 'user',
}

@Entity()
@Unique(['name'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.user })
  role: UserRole;

  @CreateDateColumn()
  createDate: string;

  @UpdateDateColumn()
  updateDate: string;

  @DeleteDateColumn()
  deleteDate: string;
}
