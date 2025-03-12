import mongoose from "mongoose"
import { Video } from "../models/videos.model.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js"

const getChannelStats = AsyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
})

const getChannelVideos = AsyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params;
    if(!channelId) throw new ApiError(400,"failed to get channel id at the moment");
     const videos = await Video.aggregate([{
        $match:{
            "owner": new mongoose.Types.ObjectId(channelId)
        }
     }])
     if(!videos) throw new ApiError(400,"problem in getting videos,");
      return res.json(new ApiResponse(200,videos,"channel videp fetched successfylly"));

     
})

export {
    getChannelStats, 
    getChannelVideos
    }