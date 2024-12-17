import {asyncHandler} from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import  {uploadOnCloudinary}   from "../utils/cloudinary.js"


//problem:  show info of created user+ image upload

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
    // console.log(username,"    ",email)
   const existedUser= await User.findOne({
    $or:[{username},{email}]
   })
   
   if(existedUser){
    throw new ApiError(409,"User with Email or Username exists")
   }
  const avatarLocalPath = req.files?.avatar?.[0]?.path || null;
 const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;


  //  if(req.files && Array.isArray(req.files.CoverImage) && req.files.CoverImage.length>0){
  //   const coverImageLocalPath=req.files.coverImage[0].path
  //  }
console.log(avatarLocalPath)
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }
   // working
   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)
   if(!avatar){
  throw new ApiError(400,"Avatar file is required")
   }

  const user=await User.create({
    fullname:fullName,
    avatar: avatar.url,
    coverimage:coverImage.url || "",
    email:email,
    password:password,
    username:username.toLowerCase()
   })
   
   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )
  //  console.log(createdUser)
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while Registering")
   }

   return res.status(201).json(new ApiResponse(200,createdUser,"User registered Successfully"))

})

const generateAccessTokenAndRefreshTokens=async(userId)=>{
  // console.log(userId)
  try{
     const user= await User.findById(userId)
    
    const accessToken= user.generateAccessToken()
    
    const refreshToken=user.generateRefreshToken()
    // console.log("refresh Token: ",refreshToken)
  
    user.refreshToken=refreshToken
    await user.save({validateBeforSave:false})
    return {accessToken,refreshToken}
  }
  catch(error){
    throw new ApiError(500,"Something Went wrong While genetrating Token")
  }
}

const loginUser =asyncHandler(async(req,res)=>{
          const {email,username,password}=req.body
          if(!(username || email)){
            throw new ApiError(400,"Username || Email is required")
          }

    const user=await User.findOne({
        $or:[{username},{email}]
      })
    if(!user){
      throw new ApiError(404,"User not found")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      throw new ApiError(401,"Incorrect Password")
    }

    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshTokens(user._id)
    const loggedinUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
      httpOnly:true,
      secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(2000,{
        user:loggedinUser,accessToken,refreshToken
      },
    "User logged in Successfully")
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set:{refreshToken:undefined}
  },{
    new:true
  })
  const options={
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
try {
   const incomingRefreshtoken= req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshtoken){
    throw new ApiError(401,"Unauthroized request")
   }
    const decodedToken=  jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"Invalid refresh token")
     }
    if(user?.refreshToken !==incomingRefreshtoken){
      if(!user){
        throw new ApiError(401," refresh token expired")
       }
    }
    const options={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newrefreshToken}=await generateAccessTokenAndRefreshTokens(user._id)
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(200,{accessToken,newrefreshToken},"Access code refreshed")
} catch (error) {
     throw new ApiError(401,error?.message||"invalid message token")
}

})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?._id)
  const passwordValidity=user.isPasswordCorrect(oldPassword)
  if(!passwordValidity){
    throw new ApiError(401,"Invalid password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
  .json(new ApiResponse(200,{},"Password changed"))

})

const getUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body
  if(!fullname || !email){
    throw new ApiError(400,"fullname ans email required")
  }
   
  const user=await User.findByIdAndUpdate(req.user?._id,{
    $set:[{fullname:fullname,email}]
  },{
    new:true
  }
).select("-password")

res.status(200)
.json(new ApiResponse(200,user,"Account Details Updated Successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const localfilepath=req.file?.path
  if(!localfilepath){
    throw new ApiError(400,"Avatar not found")
  }
  const avatar=await uploadOnCloudinary(localfilepath)
  if(!avatar){
    throw new ApiError(400,"Error while uploading avatar")
  }

  const user=await User.findByIdAndUpdate(req.user._id,
    {
      $set:[{avatar:avatar.url}]
    }
    ,{
      new:true
    }
  ).select("-password") 

  return res.status(200).json("avatar updated")
})
const updateUserCover=asyncHandler(async(req,res)=>{
  const localfilepath=req.file?.path
  if(!localfilepath){
    throw new ApiError(400,"Cover Image not found")
  }
  const coverImage=await uploadOnCloudinary(localfilepath)
  if(!coverImage){
    throw new ApiError(400,"Error while uploading Cover")
  }

  await User.findByIdAndUpdate(req.user._id,
    {
      $set:[{coverimage:coverImage.url}]
    }
    ,{
      new:true
    }
  ).select("-password") 

  return res.status(200).json("Coverimage updated")
})
export {registerUser,loginUser,logoutUser,
  refreshAccessToken,getUser,changeCurrentPassword,
  updateAccountDetails,updateUserAvatar,updateUserCover}
