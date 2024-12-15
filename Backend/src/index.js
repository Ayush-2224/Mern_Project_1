
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
    path: './.env'
});



connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`Server started at ${port}`);
    });
  })
  .catch((err) => {
    console.log("DATABASE CONNECTION FAILED", err);
    process.exit(1); // Exit the process if database connection fails
  });
