import "reflect-metadata";
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";

createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "omnyx2",
    password: "",
    database: "testDB",
    entities: [
        Photo
    ],
    synchronize: true,
}).then(async connection => {

    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "warning.png";
    photo.views = 1;
    photo.isPublished = true;

    await connection.manager.save(photo);
    console.log("Photo has been saved");

}).catch(error => console.log(error));
