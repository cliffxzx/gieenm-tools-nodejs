import {
  Entity, PrimaryGeneratedColumn, Column, EntityRepository, Repository, Unique, BaseEntity, OneToMany,
} from 'typeorm';

import CryptoJS from 'crypto-js';

import configs from '../configs';
import { Address } from './Address';

@Entity()
@Unique(['name'])
export class Host extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column('longtext')
  auth: string;

  get(): { id: number, name: string, url: string, auth: string } {
    const { id, name, url } = this;
    let { auth } = this;
    auth = CryptoJS.AES.decrypt(auth, configs.server.salt).toString(CryptoJS.enc.Utf8);
    return {
      id, name, url, auth,
    };
  }

  constructor(host: Host) {
    super();
    this.name = host?.name;
    this.url = host?.url;
    this.auth = CryptoJS.AES.encrypt(host?.auth, configs.server.salt).toString();
  }
}
