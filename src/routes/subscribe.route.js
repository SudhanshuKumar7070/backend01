import { verifyJWT } from "../middlewares/user.middleware.js";
import { Router } from "express";
import { 
    checkIsSubscribed,
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,

} from "../controllers/subscription.controller.js"
const router = Router();
 router.route("/get_channel_isSubscribed/:channelId").get(verifyJWT,checkIsSubscribed)
 router.route("/toggle_subscription/:channelId").patch(verifyJWT,toggleSubscription);
 router.route("/get_channel_subscribers_list/:channelId ").get(verifyJWT,getUserChannelSubscribers);
 router.route("/get_subscribed_channels/:subscriberId").get(verifyJWT,getSubscribedChannels);
 export default router