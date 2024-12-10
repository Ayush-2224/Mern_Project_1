// require('dotenv').config({path:'./env'})
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path:'./env'
})

connectDB()



/*
connect database directly from index.js
(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODE_URI}/${DB_NAME}`)
       application.on("error",()=>{
        console.log("Error",error);
        throw error
       })
       app.listen(port, () => console.log(`Example app listening on port ${process.env.PORT}!`));
    }
    catch(error){
        console.log("error",error)
        throw err
    }
})()

*/