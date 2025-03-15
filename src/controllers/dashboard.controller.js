import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";

const getChannelStats = AsyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const { channelId } = req.params;
  if (!channelId || !channelId.trim())
    throw new ApiError(400, "channel id is required to fetch details");

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  //  finding subscriber count of the channel
  const channelSubscriber = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: "channelSubscriber",
    },
  ]);

  // const channelSubscriber = await Subscription.find({
  //   channel:channelId
  // });
  console.log("subscriber:", channelSubscriber[0]);

  if (!channelSubscriber) {
    throw new ApiError(400, "Unable to find total channel subscribers");
  }
  const subscriberCount = channelSubscriber.length
    ? channelSubscriber[0].channelSubscriber
    : 0;

  // finding total no. videos of the channel
  const videoCount = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: "videoCount",
    },
  ]);
  if (!videoCount)
    throw new ApiError(
      400,
      "Unable to find total number of videos uploaded by channel"
    );

  const VideoNumberCount = videoCount.length ? videoCount[0].videoCount : 0;

  //  total like counts:
  const likeCount = await Like.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $count: "likeCount",
    },
  ]);
  if (!likeCount)
    throw new ApiError(
      400,
      "Unable to find total number of likes on the channel"
    );

  const LikeNumberCount = likeCount.length ? likeCount[0].likeCount : 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount, VideoNumberCount, LikeNumberCount },
        "fetched data successfully"
      )
    );
});

const getChannelVideos = AsyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
  if (!channelId)
    throw new ApiError(400, "failed to get channel id at the moment");
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);
  if (!videos) throw new ApiError(400, "problem in getting videos,");
  return res.json(
    new ApiResponse(200, videos, "channel videp fetched successfylly")
  );
});

export { getChannelStats, getChannelVideos };
