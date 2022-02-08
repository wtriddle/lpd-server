/* Various type obejcts used by GraphQL and availabe when defined in Resolvers */
import { Field, InputType } from "type-graphql";


@InputType()
export class Car_Add_Inputs {
    @Field(() => String)
    lp!: string;

    @Field(() => String)
    car_model?: string;

    @Field(() => String)
    car_color?: string;

    @Field(() => String)
    location?: string;

    @Field(() => String)
    name: string;

    @Field(() => String)
    state: string;

    @Field(() => Boolean)
    inCapture: boolean;
}


@InputType()
export class Car_Update_Inputs {
    @Field(() => String)
    lp!: string;

    @Field(() => String)
    location: string;

    @Field(() => String)
    state: string;
    
    @Field(() => Boolean, {nullable:true})
    inCapture: boolean;

    @Field(() => String, {nullable:true})
    name: string;

    @Field(() => String, {nullable:true})
    car_model: string;

    @Field(() => String, {nullable:true})
    car_color: string;
}

@InputType()
export class Multi_Car_Update {
    @Field(() => [Car_Update_Inputs])
    cars: [Car_Update_Inputs];
}