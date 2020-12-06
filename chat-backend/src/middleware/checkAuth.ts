import express from "express";
import {verifyJWToken} from "../utils";



export default (req:any,res:any,next:any) => {
    
    if(req.path === "/user/signin" || req.path === "/user/signup" || req.path === "/user/verify"){
        return next();
    }
    const token = req.headers.token;
    
    
    verifyJWToken(token).then((user:any)=>{
        req.user = user.data._doc;
        next();
    }).catch(()=>{
        res.status(403).json({message:"Invalid auth token provider"})
    })
   
}