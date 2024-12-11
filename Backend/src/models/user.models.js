import mongoose, { mongo } from "mongoose";
import jwt from "jasonwebtoken"
import bcrypt from "bcrypt"



const userSchema= new mongoose.Schema({
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true  // make easy search
      },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
      },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true 
      },
      avatar:{
        type:String,//url of image
        required:true,
      },
      coverimage:{
        type:String
      },
      watchHistory:[
        {type:Schema.Types.ObjectId,
        ref:"Video"}
      ],
      password:{
        type:String,
        required:[true,"Password is Required"]
      },
      refreshToken:{
        type:string
      }

},{timestamps:true}) 

userSchema.pre("save",async function(next){
    if(!this.isModidied("password")) return next();
     this.password=bcrypt.hash(this.password,10)
     next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}
userSchema.method.generateAccessToken=function(){
    jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
       expiresIn:process.env.ACCESS_TOKEN_EXPIRY 
    })
}
userSchema.method.generateRefreshToken=function(){
    jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
       expiresIn:process.env.ACCESS_REFRESH_EXPIRY 
    })
}



export const User=mongoose.model("User",userSchema)