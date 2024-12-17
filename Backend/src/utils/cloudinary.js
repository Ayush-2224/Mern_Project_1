// import { resourceLimits } from "worker_threads";
// import {v2 as cloudinary} from cloudinary
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

import fs from "fs"
dotenv.config({
    path: './.env'
});

cloudinary.config({ 
    cloud_name: process.env.cloudinary_cloud_name, 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret 
});


const uploadOnCloudinary=async(localFilepath)=>{
// console.log(fs.existsSync(localFilepath)); // Should return true

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

