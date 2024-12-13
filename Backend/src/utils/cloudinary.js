import { resourceLimits } from "worker_threads";
import {v2 as cloudinary} from cloudinary
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.cloudinary_cloud_name, 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret 
});

const uploadOnCloudinary=async(localFilepath)=>{
    try{
            if(!localFilepath) return null
          const response=  await cloudinary.uploder.upload(localFilepath,{
                resource_type:"auto"
            })
            console.log("file is uploded on cloudinary",response.url);
            return response;
    }
    catch(error){
        fs.unlinkSync(localFilepath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}