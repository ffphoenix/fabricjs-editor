import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765558859107 implements MigrationInterface {
    name = 'Migration1765558859107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying, "firstName" character varying, "lastName" character varying, "isActive" boolean NOT NULL DEFAULT true, "role" character varying NOT NULL DEFAULT 'user', "googleId" character varying, "pictureUrl" character varying, "provider" character varying NOT NULL DEFAULT 'local', "refreshToken" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_470355432cc67b2c470c30bef7" ON "user" ("googleId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_470355432cc67b2c470c30bef7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
