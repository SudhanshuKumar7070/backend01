import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
const router = Router();

import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

router.route("/get_channel_video/:channelId").get(verifyJWT, getChannelVideos);
 export default router