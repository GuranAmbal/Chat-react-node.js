import express from "express";
import { createJWToken } from "../utils";
import { UsersModel } from "../models";
import socket from "socket.io";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import generatePasswordHash from "../utils/generatePasswordHash";

class UserController {

  io: socket.Server;
  constructor(io: socket.Server) {
    this.io = io
  }

  show = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    UsersModel.findById(id, (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          message: "Not found"
        })
      }
      res.json(user);
    });
  }
  create = (req: express.Request, res: express.Response) => {

    const postData = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password,

    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const user = new UsersModel(postData);

    user.save()
      .then((obj: any) => {
        res.json(obj);
      }).catch(reason => {
        res.status(500).json({
          status: "error",
          message: reason
        })
      });

  };
  verify = (req: express.Request, res: express.Response) => {
    const hash = req.query.hash

    if (!hash) {
      return res.status(422).json({ errors: "Invalid hash" });
    }

    UsersModel.findOne({ confirm_hash: hash }, (err, user: any) => {
      if (err || !user) {
        return res.status(404).json({
          status: "error",
          message: "User not found"
        })
      }
      user.confirmed = true;
      user.save((err: any) => {
        if (err) {
          return res.status(404).json({
            status: "error",
            message: err
          })
        }
        res.json({
          status: "success",
          message: "Аккаунт успешно подтвержден"
        });

      })
    });
  }

  login = (req: express.Request, res: express.Response) => {
    const postData = {
      email: req.body.email,
      password: req.body.password
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    UsersModel.findOne({ email: postData.email }, (err, user: any) => {
      if (err) {
        return res.status(404).json({
          message: "Not found"
        })
      }

      if (bcrypt.compareSync(postData.password, user.password)) {
        const token = createJWToken(user)

        res.json({
          status: "success",
          token
        });
      } else {
        res.status(403).json({
          status: "error",
          message: "Incorrect password or email"
        })
      }
    })
  }
  getMe = (req: any, res: express.Response) => {
    const id: string = req.user._id;
    UsersModel.findById(id, (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          message: "Not found"
        })
      }
      res.json(user);
    });

  }
  findUsers = (req: any, res: express.Response) => {
    const query: string = req.query.query;
    UsersModel.find()
      .or([{ fullname: new RegExp(query, "i") }, { email: new RegExp(query, "i") }])
      .then((users:any) => res.json(users))
      .catch((err:any) => {
        return res.status(404).json({
          status:"error",
          message: err
        })
      })
  }

  delete = (req: express.Request, res: express.Response) => {

    const id: string = req.params.id;
    UsersModel.findByIdAndRemove({ _id: id })
      .then(user => {
        if (user) {
          res.json({
            message: `User ${user.fullname} delete`
          })
        }
      })
      .catch(() => {
        res.status(404).json({
          message: "User not find"
        })
      })

  }

}

export default UserController