import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    listAllTweets
} from "../controllers/tweet.controller.js"
const router = Router();
  
 router.route("/createTweet").post(verifyJWT,createTweet)
 router.route("/Tweets").get(verifyJWT,getUserTweets)
 router.route("/all_tweets").get(verifyJWT,listAllTweets)
router.route("/updateTweet/:tweetId").patch(verifyJWT,updateTweet)
 router.route("/deleteTweet/:tweetId").post(verifyJWT,deleteTweet)
export  default router