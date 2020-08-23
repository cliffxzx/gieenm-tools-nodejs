import {
  Entity,
  Unique,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { AddressGroup } from './AddressGroup';

@Entity()
@Unique('uid', ['uidN', 'uidTime'])
@Unique('address', ['ip', 'subnet', 'mac', 'user', 'group'])
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uidN: string;

  @Column()
  uidTime: string;

  @Column()
  ip: string;

  @Column()
  subnet: string;

  @Column()
  mac: string;

  @JoinColumn()
  @OneToOne((type) => AddressGroup, (group) => group.name)
  group: AddressGroup;

  @JoinColumn()
  @OneToOne((type) => User, (user) => user.name)
  user: User;

  @CreateDateColumn()
  createDate: string;

  @UpdateDateColumn()
  updateDate: string;

  @DeleteDateColumn()
  deleteDate: string;
}
