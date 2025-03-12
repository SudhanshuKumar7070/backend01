import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
const router = Router();
router.route("/toggle_like_video/:videoId").patch(verifyJWT,toggleVideoLike)
router.route("/toggle_like_comment/:commentId").patch(verifyJWT,toggleCommentLike)
router.route("/toggle_like_tweet/:tweetId").patch(verifyJWT,toggleTweetLike)
export default router;
