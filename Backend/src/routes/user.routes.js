import {Router} from "express"
import { logoutUser, registerUser,loginUser,refreshAccessToken,changeCurrentPassword,getUserchannelProfile,getWatchHistory,getUser,updateAccountDetails,updateUserAvatar,updateUserCover } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
const router =Router()
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { get } from "mongoose";
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },

        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/change-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/change-coverimage").patch(verifyJWT,upload.single("coverimage"),updateUserCover)
router.route("/c/:username").get(verifyJWT,getUserchannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)


//secured routes

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
export default router