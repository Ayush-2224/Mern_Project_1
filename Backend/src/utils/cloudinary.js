// import { resourceLimits } from "worker_threads";
// import {v2 as cloudinary} from cloudinary
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

import fs from "fs"
dotenv.config({
    path: './.env'
});

// const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


const uploadOnCloudinary=async(localFilepath)=>{
    
    try{
            if(!localFilepath) return null
          const response=  await cloudinary.uploader.upload(localFilepath,{
                resource_type:"auto"
            })
            console.log("file is uploded on cloudinary",response.url);
            fs.unlinkSync(localFilepath)
            return response;
    }
    catch(error){
        console.log(error)
        fs.unlinkSync(localFilepath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}

