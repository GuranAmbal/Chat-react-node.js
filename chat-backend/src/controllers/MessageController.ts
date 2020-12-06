import express from "express";
import { MessageModel, DialogModel } from "../models";
import socket from "socket.io";
import { query } from "express-validator";

class MessageController {
  io: socket.Server;
  constructor(io: socket.Server) {
    this.io = io
  }
  index = (req: express.Request, res: express.Response) => {
    const dialogId: any = req.query.dialog;
    const userId = req.user._id;

    MessageModel.updateMany({ "dialog": dialogId, user: { $ne: userId } }, { "$set": { readed: true } }, (err: any) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: err
        })
      }
    })


    MessageModel.find(
      { dialog: dialogId })
      .populate(["dialog", "user", "attachments"])
      .exec(function (err: any, messages: any) {
        if (err) {
          return res.status(404).json({
            message: "Messages not found"
          })
        }
        return res.json(messages)
      })
  }

  create = (req: any, res: express.Response) => {
    const userId = req.user._id;
    const postData = {
      text: req.body.text,
      user: userId,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments

    }

    const message = new MessageModel(postData);


    message
      .save()
      .then((obj: any) => {

        obj.populate(["dialog", "user", "attachments"], (err: any, message: any) => {

          if (err) {
            return res.status(500).json({
              status: "error",
              message: err
            })
          }
          DialogModel.findByIdAndUpdate(
            { _id: postData.dialog },
            { lastMessage: message._id },
            { upsert: true },
            function (err) {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: err
                })
              }

            })

          this.io.emit("SERVER:NEW_MESSAGE", message);
          res.json(message);
        });

      }).catch(reason => {
        res.json(reason);
      });

  }
  delete = (req: express.Request, res: express.Response) => {

    const id: string = req.query.id;
    const userId: string = req.user._id;

    MessageModel.findById(id, (err, message: any) => {
      if (err || !message) {
        return res.status(404).json({
          status: "error",
          message: "Message not find"
        })
      }

      if (message.user.toString() === userId) {

        const dialogId = message.dialog;
        message.remove();

        MessageModel.findOne({ dialog: dialogId }, {}, { sort: { 'created_at': -1 } }, function (err, lastMessage) {
          if (err) {
            res.status(500).json({
              status: "error",
              message: err
            })
          }
          DialogModel.findById(dialogId, (err, dialog: any) => {
            if (err) {
              res.status(500).json({
                status: "error",
                message: err
              })
            }
            dialog.lastMessage = lastMessage;
            dialog.save()
          })
        })


        return res.json({
          status: "success",
          message: "Message deleted"
        })
      } else {
        return res.status(403).json({
          status: "error",
          message: "Not have pormission"
        })
      }

    });

  };
}

export default MessageController