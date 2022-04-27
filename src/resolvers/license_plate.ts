/* GraphQL Resolver Functions to Query & Mutate (Update) the connected PostgresQL Database */
import { Car_Add_Inputs, Car_Update_Inputs, Multi_Car_Update } from "../types/License_Plate_Types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { License_Plate } from "../entities/License_Plate";
import { MyContext } from "../MyContext";

@ObjectType()
class CarStream {
  @Field(() => [License_Plate], { nullable: true })
  cars: License_Plate[];
}

/* Main Resolver */
@Resolver()
export class license_plate_resolver {

    /* Finds a Single Car with License Plate from the database */
    @Query(() => License_Plate, {nullable: true})
    async find_car(
        @Arg('lp', () => String) lp : string,
        @Ctx() {em}: MyContext
    ): Promise<License_Plate | null> {
        return em.findOne(License_Plate, {lp});
    }

    /* Removes a single car by license plate from the database */
    @Mutation(() => License_Plate, {nullable: true})
    async remove_car(
        @Arg('lp', () => String) lp : string,
        @Ctx() {em}: MyContext
        ): Promise<License_Plate | null> {
            const car = await em.findOne(License_Plate, {lp});
            await em.nativeDelete(License_Plate, {lp});
            return car;
        }
        
    /* Removes all cars from the database*/
    @Mutation(() => Number, {nullable: true})
    async remove_all(
        @Ctx() {em}: MyContext
    ): Promise<number | null> {
        await em.nativeDelete(License_Plate, {});
        return null;
    }

    /* Adds a New Car (row) to the database */
    @Mutation(() => License_Plate, {nullable: true})
    async add_car(
        @Arg('inputs', () => Car_Add_Inputs) inputs : Car_Add_Inputs,
        @Ctx() {em}: MyContext
    ) {

        /* Exit for false inputs */
        if(!inputs.lp)
        {
            console.log("License plate was invalid for adding a car");
            return null;
        }

        /* Exit for Existing Cars (Identified by License Plate) */
        const existing_lp = await em.findOne(License_Plate, {lp: inputs.lp});
        if(existing_lp) {
            console.log("Car License Plate is already in the database");
            return null;
        }

        /* Add New Car to Database */
        const data: Car_Add_Inputs = {
            lp: inputs.lp,
            car_model: inputs.car_model ? inputs.car_model : "N/A",
            car_color: inputs.car_color ? inputs.car_color : "N/A",
            //updatedAt: inputs.updatedAt,
            location: inputs.location ? inputs.location : "N/A",
            name: inputs.name ? inputs.name : "N/A",
            state: inputs.state ? inputs.state : "N/A",
            inCapture: inputs.inCapture
        };
        const new_car = await em.create(License_Plate, data);
        await em.persistAndFlush(new_car);

        /* Expose return car from GraphQL */
        return new_car;
    }

    /* Updates Single Existing Car (row) in the database */
    @Mutation(() => License_Plate, {nullable: true})
    async update_car(
        @Arg('inputs', () => Car_Update_Inputs) inputs : Car_Update_Inputs,
        @Ctx() {em}: MyContext
    ) {

        /* Exit for false inputs */
        if(!inputs.lp)
        {
            console.log("License plate was invalid for updating a car");
            return null;
        }

        /* Exit for Existing Cars (Identified by License Plate) */
        const existing_car = await em.findOne(License_Plate, {lp: inputs.lp});
        if(!existing_car) {
            console.log("Car License Plate does not exist in the database");
            return null;
        }
        
        /* Update Existing Car */
        existing_car.location = inputs.location;
        //existing_car.updatedAt = inputs.updatedAt;
        existing_car.state = inputs.state ? inputs.state : "N/A"
        existing_car.inCapture = inputs.inCapture;
        await em.persistAndFlush(existing_car);

        /* Return Updated Car to GraphQL */
        return existing_car;
    }


    /* Updates Cars In New Captured Image*/
    @Mutation(() => CarStream, {nullable: true})
    async update_cars_in_image(
        @Arg('inputs', () => Multi_Car_Update) inputs : Multi_Car_Update,
        @Ctx() {em}: MyContext
    ) {

        /* Reset Previous Image Cars */
        const prev_seen: License_Plate[] | null = await em.find(License_Plate, {inCapture:true});
        if(!prev_seen)
        {
            console.log("No cars were found in the current picutre...");
        }
        else {
            let overwrite_car;        
            for(let i = 0; i < prev_seen.length; i+=1)
            {
                overwrite_car = prev_seen[i];
                overwrite_car.inCapture = false;
                await em.persistAndFlush(overwrite_car);
            }
        }

        /* Set all InCapture cars*/
        if(!inputs.cars)
        {
            console.log("No cars were given to updates");
            return null;
        }

        /* Create a list of license plates */
        let lp: [string] = [inputs.cars[0].lp];
        let total = 0;
        for(let i = 1; i < inputs.cars.length; i +=1)
        {
            total = lp.push(inputs.cars[i].lp);
        }

        console.log("Updating the following fields:", lp);
        console.log("Number of cars being updated:", total);

        /* Locate all cars in Database */
        // Assume all identified license plates are already in the databse
        // Not considering When a LP on screen is not part of the DB, add later
        const existing_cars: License_Plate[] | null = await em.find(License_Plate, {lp: lp});
        console.log("existing cars", existing_cars);

        if(!existing_cars) {
            console.log("Car License Plates do not exist in the database");
            return null;
        }

        /* Update All Incoming Identified Cars */
        let new_car;
        for(let i = 0; i < inputs.cars.length; i+=1)
        {
            /* Update Single Car in Capture */
            new_car = existing_cars[i];
            new_car.location =  inputs.cars[i].location ?  inputs.cars[i].location : "N/A";
            //new_car.updatedAt = inputs.cars[i].updatedAt;
            new_car.state = inputs.cars[i].state ?  inputs.cars[i].state : "N/A";
            new_car.inCapture = true;
            console.log(new_car);

            /* Push update to Database */
            await em.persistAndFlush(new_car);
        }
        
        /* Return Updated Cars to GraphQL */
        return {cars: existing_cars};
    }


    /* Updates Any Set of Cars*/
    @Mutation(() => CarStream, {nullable: true})
    async update_cars(
        @Arg('inputs', () => Multi_Car_Update) inputs : Multi_Car_Update,
        @Ctx() {em}: MyContext
    ) {

        /* Exit for false inputs */
        if(!inputs.cars)
        {
            console.log("No cars were given to updates");
            return null;
        }

        /* Create a list of license plates */
        let lp: [string] = [inputs.cars[0].lp];
        let total = 0;
        for(let i = 1; i < inputs.cars.length; i +=1)
        {
            total = lp.push(inputs.cars[i].lp);
        }
        console.log("Updating the following fields:", lp);
        console.log("Number of cars being updated:", total);

        /* Locate all cars in Database */
        // Assume all identified license plates are already in the databse
        // Not considering When a LP on screen is not part of the DB, add later
        const existing_cars: License_Plate[] | null = await em.find(License_Plate, {lp: lp});
        console.log("existing cars", existing_cars);

        if(!existing_cars) {
            console.log("Car License Plates do not exist in the database");
            return null;
        }

        /* Update All Target Cars */
        let new_car;
        for(let i = 0; i < inputs.cars.length; i+=1)
        {
            /* Update Single Car */
            new_car = existing_cars[i];
            new_car.location =  inputs.cars[i].location ?  inputs.cars[i].location : "N/A";
            //new_car.updatedAt = inputs.cars[i].updatedAt;
            new_car.state = inputs.cars[i].state ?  inputs.cars[i].state : "N/A";
            new_car.inCapture = inputs.cars[i].inCapture;
            new_car.name = inputs.cars[i].name ? inputs.cars[i].name : new_car.name;
            new_car.car_color = inputs.cars[i].car_color ? inputs.cars[i].car_color : new_car.car_color;
            new_car.car_model = inputs.cars[i].car_model ? inputs.cars[i].car_model : new_car.car_model;
            console.log(new_car);

            /* Push update to Database  */
            await em.persistAndFlush(new_car);
        }
        
        /* Return Updated Cars to GraphQL */
        return {cars: existing_cars};
    }


    /* Returns All Captured Cars in Image */
    @Query(() => CarStream)
    async car_stream(
        @Ctx() {em}: MyContext
    ): Promise<CarStream> {
        const cars: License_Plate[] = await em.find(License_Plate, {inCapture: true});
        console.log("cars", cars);
        if (cars.length == 0) return {cars:[]};
        else return {cars};
    }

};