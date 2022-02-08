/* MikroORM interface file for database schema (i.e. database table) creation */

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// @Field controls if the column from PostgreSQL database table is exposed to GraphQL

@Entity()
@ObjectType()
export class License_Plate{

    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({unique: true})
    lp!: string;

    @Field(() => String)
    @Property({type: "text"})
    car_model: string;

    @Field(() => String)
    @Property({nullable: true, type: "text"})
    car_color?: string;

    @Field(() => String)
    @Property({type: "date", onCreate: () => new Date() })
    createdAt: Date;

    @Field(() => String)
    @Property({type: "date", onUpdate: () => new Date(), onCreate: () => new Date() })
    updatedAt: Date;

    @Field(() => String)
    @Property({type: "text"})
    location: string;

    @Field(() => String)
    @Property({type: "text"})
    name: string;

    @Field(() => String)
    @Property({type: "text"})
    state: string;

    @Field(() => Boolean)
    @Property({type: "boolean"})
    inCapture: boolean;
}