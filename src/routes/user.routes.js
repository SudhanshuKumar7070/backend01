import { Router}from "express"
   import {LoginUser, registerUser,LogoutUser,getNewAccessToken} from "../controllers/user.controllers.js"
   import{ upload }from "../middlewares/multer.middleware.js"
   import {verifyJWT} from "../middlewares/user.middleware.js"
const router = Router();
  
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJWT,LogoutUser)
router.route("/genrateAccesToken").post(getNewAccessToken);
export default router