
import express from "express";
import {createServer} from "http";
import dotenv from "dotenv";

dotenv.config();

import  "./core/db";
import  createRouts from "./core/routes";
import  createSocket from "./core/socket";



const app = express();
const http = createServer(app);
const io = createSocket(http);

createRouts(app, io);


http.listen(process.env.PORT, function () {
  console.log(`Example app listening on ${process.env.PORT} !`);
});