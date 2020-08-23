import {
  Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity, OneToOne, JoinColumn,
} from 'typeorm';
import { Host } from './Host';

@Entity()
@Unique('uid', ['uidN', 'uidTime'])
@Unique('group', ['name', 'host'])
export class AddressGroup extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uidN: string;

  @Column()
  uidTime: string;

  @Column()
  name: string;

  @JoinColumn()
  @OneToOne((type) => Host, (host) => host.name)
  host: Host;
}
