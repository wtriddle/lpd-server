/* Main Server Configurations & Routing */
import "dotenv-safe/config"
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
//import { License_Plate } from "./entities/License_Plate";
import microConfig from './mikro-orm.config'
import express from "express";
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { license_plate_resolver } from "./resolvers/license_plate";
// import cloudinary from "./utils/createCloudinaryClient";

// Main NodeJS program with all components of backend
const main = async () => {          // Async ES6 function call to allow promise-await interaction

    /* -------------Express (Basic JS server with URL routing)------------------- */
    const app = express();          // Handles server routing
    app.get("/", (_, res) => {      // express endpoint example
        res.send("Welcome to the website! Re-route to /graphql to access the graphql database");          
    });
    app.listen(parseInt(process.env.PORT), () => {        // Listen === define port enpoint to allow connections
      console.log('server started lets go');
      console.log(process.env.DATABASE_URL);
      console.log(process.env.DATABASE_NAME);
    })
    /*--------------------------------------------------------------------------- */
    
    /* ORM database w/ PostgreSQL (Tables and Database Schema manegment) */
    const orm = await MikroORM.init(microConfig);       // Link MikroORM interface in JS to postgres server );
    await orm.getMigrator().up();
    /*----------------------------------------------------------------- */
    
    /* -------------Image POST Endpoint------------------- */
    /*
    app.use(express.json({limit: '50mb'}));
    app.use(express.urlencoded({limit: '50mb'}));
    app.post("/", async (req, res) => {      // post image endpoint
        if(req.body.image)
        {
            const file = req.body.image;
            if (typeof file === "string") {
                res.send({"data": "1"});
                console.log("Uploading to cloudinary");
                
                
                await cloudinary.v2.uploader.upload(
                  file,
                  {
                    public_id: "myfolder/sub_test",
                    chunk_size: Math.pow(6.4, 7),
                    invalidate: true,
                  },
                  (error, result) => {
                    console.log(result, error);
                    return false;
                  }
                );
              } else {
                console.log("The upload photo was not a data url string");
                return false;
              }
        }
        else {
            console.log("req.body not available");
        }
        //res.send("You have posted to the enpoint");          
        return Promise;
    });
    */
    /*--------------------------------------------------------------------------- */

    /* -------Apollo Server for GraphQL (Advanced JS server for GraphQL API)---------- */
    const apollo_server = new ApolloServer({
        schema: await buildSchema({         // GraphQL schema hooked up to Apollo server router
            resolvers: [license_plate_resolver],
            validate: false
        }),
        context: () => ({em: orm.em})           // req, res come from express
    });
    await apollo_server.start();                // Await the server to start
    apollo_server.applyMiddleware({app});       // Create graphql endpoint via express
    /*-------------------------------------------------------------------------------- */

}

/* Invoke Main and Catch any erros from the server */
main().catch(err => {
    console.log(err);
});