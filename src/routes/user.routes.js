import { Router } from "express";
import {
  LoginUser,
  registerUser,
  LogoutUser,
  getNewAccessToken,
  updateFullName,
  UpdateCurrentPassword,
  updateEmail,
  updateAvatarImage,
  updateCoverImage
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/user.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(LoginUser);
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/genrateAccesToken").post(getNewAccessToken);
router.route("/changePassword").post(verifyJWT, UpdateCurrentPassword);
router.route("/updateFullName").post(verifyJWT, updateFullName);
router.route("/updateEmail").post(verifyJWT, updateEmail);
router.route("/updateAvatarImage").post(verifyJWT,upload.fields(
  [{
    name:"avatar",
    maxCount:1
  }]
),
updateAvatarImage)

router.route("/updateCoverImage").post(verifyJWT,upload.fields(
  [{
    name:"coverImage",
    maxCount:1
  }]
),
updateCoverImage)



export default router;
