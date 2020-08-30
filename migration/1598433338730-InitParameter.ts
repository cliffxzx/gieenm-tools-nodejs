import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitParameter1598433338730 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('set global innodb_large_prefix=1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
