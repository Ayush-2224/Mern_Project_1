import mongoose from "mongoose";
import jwt from "jsonwebtoken"
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
      },
      coverimage:{
        type:String
      },
      watchHistory:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:"Video"}
      ],
      password:{
        type:String,
        required:[true,"Password is Required"]
      },
      refreshToken:{
        type:String
      }

},{timestamps:true}) 

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
     this.password=await bcrypt.hash(this.password,10)
     next()
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
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
userSchema.methods.generateRefreshToken = function () {
  

  try {
      const token = jwt.sign(
          { _id: this._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.refresh_token_expiry }
      );
      
      return token;
  } catch (error) {
      console.error("Error generating refresh token:", error);
      throw new Error("Failed to generate refresh token");
  }
};



export const User=mongoose.model("User",userSchema)