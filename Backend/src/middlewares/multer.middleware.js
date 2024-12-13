import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) //It will be saved in server for very tiny amount so multipk=le samer will nogt create problem very much
    }
  })
  
  export const upload = multer({ storage,})