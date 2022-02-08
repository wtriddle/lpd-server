/* Connect Mikro ORM to postgresql */
import { __prod__ } from "./constants";
import { License_Plate } from "./entities/License_Plate";
import {MikroORM} from "@mikro-orm/core";
import path from "path";


export default {
    migrations: {
        path: path.join(__dirname, './migrations'),     // Dirname to DIST folder
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [License_Plate],
    dbName: process.env.DATABASE_NAME as string,
    type: 'postgresql',
    debug: !__prod__,
    user: 'postgres',
    password: '123',
    clientUrl: process.env.DATABASE_URL,
    port: 5432
} as Parameters<typeof MikroORM.init>[0];

