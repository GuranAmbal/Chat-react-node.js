import express from "express";
import {DialogModel, MessageModel} from "../models";
import socket from "socket.io";

class DialogController{
  io: socket.Server;
  constructor(io:socket.Server){
    this.io=io
  }
    index=(req:any, res:express.Response)=>{
        const userId = req.user._id;

        DialogModel.find().or([{author:userId}, {partner:userId}])
          .populate(["author","partner","lastMessage"])
          .populate({
            path:"lastMessage",
            populate:{
              path:"user"
            }
          })
          .exec(function(err,dialogs){
            if(err){
              return res.status(404).json({
                message:"Dialog not found"
              })
            }
            return res.json(dialogs)
          })
    }
  
    create=(req:express.Request, res:express.Response)=> {
       
        const postData ={
          author:req.user._id,
          //author:req.body._id,
          partner:req.body.partner,
          
        }
       
       const dialogs = new DialogModel(postData);
       
      
       dialogs.save().then((dialogObj:any)=>{
          const message = new MessageModel({
            text:req.body.text,
            dialog:dialogObj._id,
            user:req.user._id
          })
          message.save()
          .then(()=>{
            dialogObj.lastMessage = message._id;
            dialogObj.save().then(()=>{
              res.json(dialogObj);
              this.io.emit("SERVER:DIALOG_CREATED",{
                ...postData,
                dialog:dialogObj
              });
            })
            
          })
            .catch(reason=>{
              res.json(reason);
            });
        })
        .catch(reason=>{
          res.json(reason);
        });
        
      }
delete=(req:express.Request, res:express.Response)=> {
       
    const id: string = req.params.id;
    DialogModel.findByIdAndRemove({_id:id})
    .then(dialog=>{
        if(dialog){
        res.json({
            message:`Dialog delete`
        })
      }
    })
    .catch(()=>{
        res.status(404).json({
            message:"Dialog not find"
        })
    })
        
  }
}

export default DialogController