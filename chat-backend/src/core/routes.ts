import {updateLastSeen, checkAuth} from "../middleware";
import express from "express";
import socket from "socket.io";
import { loginValidation,registerValidation } from "../utils/validation";
import {UserCtrl, DialogCtrl, MessageCtrl, UploadFileCtrl} from "../controllers";
import bodyParser from "body-parser";

import multer from "./multer"

export default (app:express.Express, io:socket.Server) => {
    const UserController = new UserCtrl(io);
    const DialogController = new DialogCtrl(io);
    const MessageController = new MessageCtrl(io);
    const UploadFileController = new UploadFileCtrl();

    app.use(bodyParser.json());
    app.use(checkAuth);
    app.use(updateLastSeen);
    

    app.get("/user/me", UserController.getMe);
    app.post("/user/signup",  registerValidation, UserController.create);
    app.post("/user/signin", loginValidation, UserController.login);
    app.get("/user/verify", UserController.verify);
    app.get("/user/find", UserController.findUsers);
    app.get("/user/:id", UserController.show);
    app.delete("/user/:id", UserController.delete);

    app.get("/dialogs", DialogController.index);
    app.post("/dialogs", DialogController.create);
    app.delete("/dialogs/:id", DialogController.delete);

    app.get("/messages", MessageController.index);
    app.post("/messages", MessageController.create);
    app.delete("/messages", MessageController.delete);

    app.post("/files", multer.single('file'), UploadFileController.create);
    app.delete("/files", UploadFileController.delete);
}