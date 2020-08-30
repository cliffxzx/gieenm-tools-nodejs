import {
  Entity,
  Unique,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { AddressGroup } from './AddressGroup';
import { Host } from './Host';

@Entity()
@Unique('address', ['uidN', 'uidTime', 'user', 'group'])
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
  @ManyToOne((type) => AddressGroup, (group) => group.name, { onDelete: 'CASCADE' })
  group: AddressGroup;

  @JoinColumn()
  @ManyToOne((type) => User, (user) => user.name, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @JoinColumn()
  @ManyToOne((type) => Host, (host) => host.name, { onDelete: 'CASCADE' })
  host: Host;

  @CreateDateColumn()
  createDate: string;

  @UpdateDateColumn()
  updateDate: string;

  @DeleteDateColumn()
  deleteDate: string;
}
