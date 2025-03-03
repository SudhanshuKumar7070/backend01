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
  updateCoverImage,
  currentLoggedinUser,
  getUserChannelProfile,
  getWatchHistory,
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
router.route("/getCurrentUser").get(verifyJWT, currentLoggedinUser);

router.route("/updateFullName").patch(verifyJWT, updateFullName);

router.route("/updateEmail").patch(verifyJWT, updateEmail);
router
  .route("/updateAvatarImage")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);

router
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/channel/:userName").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);
export default router;
