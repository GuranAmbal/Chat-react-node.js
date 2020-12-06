import express from "express";
import { UploadFileModel } from "../models";
import cloudinary from "../core/cloudinary"


class UserController {

  create = (req: any, res: any) => {
    const userId = req.user._id
    const file: any = req.file
    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto" }, (error: any, result: any) => {
        if (error) {
          throw new Error(error)
        }
        const fileData = {
          filename: result.original_filename,
          size: result.bytes,
          url: result.url,
          ext: result.format,
          user: userId

        };
        let uploadFile = new UploadFileModel(fileData);

        uploadFile
          .save()
          .then((fileObj: any) => {
            res.json({
              status: "success",
              file: fileObj
            });
          }).catch((err: any) => {
            res.json({
              status: "error",
              message: err
            })
          })

      })
      .end(file.buffer)




  }
  delete = () => { }
}

export default UserController