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
import fs from 'fs';
import cors from 'cors';


// import cloudinary from "./utils/createCloudinaryClient";

// Main NodeJS program with all components of backend
const main = async () => {          // Async ES6 function call to allow promise-await interaction

    /* -------------Express (Basic JS server with URL routing)------------------- */
    const app = express();          // Handles server routing
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.get("/", (_, res) => {      // express endpoint example
        res.send("Welcome to the website! Re-route to /graphql to access the graphql database");          
    });

    /* --------------------------Image Version Handler-------------------------- */
    app.post("/version", (req,res) => {
      console.log("Recieved");
      if(req.body) {
        console.log("body is ", req.body);
      }
      if(req.body.version) {
        fs.writeFile("./image_version.txt", req.body.version, () => console.log("Saved!"));
        res.send("Success!");
        console.log("Success");
      }
      else {
        res.send("There was an error in uploading the version")
      }
      
    });

    app.get("/version", (_, res) => {
        fs.readFile('./image_version.txt', 'utf8' , (err, data) => {
          if (err) {
            console.error(err)
            res.send(err);
            return
          }
          res.send({"version" : data});
        });
    });
    /*--------------------------------------------------------------------------- */
    
    /*-------------------------Port Listener------------------------------------- */
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