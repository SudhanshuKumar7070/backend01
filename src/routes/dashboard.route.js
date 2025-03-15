import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
const router = Router();

import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

router.route("/get_channel_video/:channelId").get(verifyJWT, getChannelVideos);
router.route("/get_channel_stats/:channelId").get(verifyJWT, getChannelStats);
 export default router