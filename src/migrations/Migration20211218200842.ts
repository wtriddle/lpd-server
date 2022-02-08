import { Migration } from '@mikro-orm/migrations';

export class Migration20211218200842 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "postgres" ("id" serial primary key, "lp" varchar(255) not null, "car_model" text not null, "car_color" text null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "location" text not null, "name" text not null, "state" text not null, "in_capture" bool not null);');
    this.addSql('alter table "postgres" add constraint "license_plate_lp_unique" unique ("lp");');
  }

}
