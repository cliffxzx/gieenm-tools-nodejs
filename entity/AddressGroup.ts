import {
  Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity, ManyToOne, JoinColumn,
} from 'typeorm';
import { Host } from './Host';

@Entity()
@Unique('group', ['uidN', 'uidTime', 'name', 'host'])
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
  @ManyToOne((type) => Host, (host) => host.name, { onDelete: 'CASCADE' })
  host: Host;
}
