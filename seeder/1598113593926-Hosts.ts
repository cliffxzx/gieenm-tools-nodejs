import fs from 'fs';
import {
  MigrationInterface, QueryRunner, getRepository,
} from 'typeorm';

import { Host } from '../entity/Host';

export class Hosts1598113593926 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPrivacy = (await fs.existsSync('seeder/privacy/data/hosts.json'));
    const hosts: Host[] = (await import(`../seeder/${hasPrivacy ? 'privacy/' : ''}data/hosts.json`)).default;

    const hostRepository = getRepository(Host, 'seeder');
    await Promise.all(hosts.map((host) => hostRepository.save(new Host(host))));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPrivacy = (await fs.existsSync('seeder/privacy/data/hosts.json'));
    const hosts: Host[] = (await import(`../seeder/${hasPrivacy ? 'privacy/' : ''}data/hosts.json`)).default;

    const hostRepository = getRepository(Host, 'seeder');
    await Promise.all(
      hosts.map((host) => hostRepository.delete({ name: host.name, url: host.url })),
    );
  }
}
