import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

import {User} from "../models/user.models.js"
import  {uploadOnCloudinary}   from "../utils/cloudinary.js"

const registerUser=asyncHandler(async(req,res)=>{
    const {fullName,email,username,password}=req.body
    console.log("email: ",email)
    // if(fullName===""){
    //     throw new ApiError(400,"full name is required")
    // }

    if([fullName,email,username,password].some((field)=>
        field?.trim()==="")
   ){
    throw new ApiError(400,"full name is required")
   }
    console.log(username,"    ",email)
   const existedUser= await User.findOne({
    $or:[{username},{email}]
   })
   
   if(existedUser){
    throw new ApiError(409,"User with Email or Username exists")
   }
//    const avatarLocalPath = req.files?.avatar?.[0]?.path || null;
// const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
// console.log(avatarLocalPath)
//    if(!avatarLocalPath){
//     throw new ApiError(400,"Avatar file is required")
//    }
//    // working
//    const avatar= await uploadOnCloudinary(avatarLocalPath)
//    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
//    console.log(avatar)
//    if(!avatar){
//     throw new ApiError(400,"Avatar file is required")
//    }

  const user=await User.create({
    fullname:fullName,
    avatar: "not found",
    coverimage:"",
    email:email,
    password:password,
    username:username.toLowerCase()
   })
   
   const createdUser=User.findById(user._id).select(
    "-password -refreshToken"
   ).lean()
  //  console.log(createdUser)
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while Registering")
   }

   return res.status(201).json(new ApiResponse(200,"User registered Successfully"))

})

export {registerUser}