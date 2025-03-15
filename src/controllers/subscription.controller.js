import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";

const checkUserSubscription = async (req, channelId) => {
  
  if (!channelId)
    throw new ApiError(400, "something went wrong As ChannelId not found");
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: new mongoose.Types.ObjectId(channelId),
  });
  if (!isSubscribed) return false;

  return true;
};
const checkIsSubscribed = AsyncHandler(async (req, res, next) => {
  //  this controller aims to check whether the channel is subscribed by user or not
  const { channelId } = req.params;
  const isChannelSubscribed = await checkUserSubscription(req, channelId);
  if (!isChannelSubscribed) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }),
        "channel is not subscribed"
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "channel is subscribed"));
});

// if user is subscribed, it sets
//  to unsubscribed and vice versa
const toggleSubscription = AsyncHandler(async (req, res, next) => {
  const { channelId } = req.params;
  const isSubscribed = await checkUserSubscription(req, channelId);
  if (isSubscribed === false) {
    const newSubscription = await Subscription.create({
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId),
    });
    if (!newSubscription) throw new ApiError(500, "can't subscribe channel ");
    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: true }, "channel subscribed"));
  } else {
    const deleteSubscription = await Subscription.findOneAndDelete({
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId),
    });
    if (!deleteSubscription)
      throw new ApiError(500, "can't unsubscribe the channel");

    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "channel undsubscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = AsyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId)
    throw new ApiError(400, "channel id id not found at the moment");
  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);
  if (!subscriberList)
    throw new ApiError(500, "unable to get subscriber list at the moment");
  return res
    .status(200)
    .json(new ApiResponse(200, subscriberList, "fetched list successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = AsyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId)
    throw new ApiError(400, "channel id id not found at the moment");
  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
  ]);
  if (!channelList)
    throw new ApiError(500, "unable to get subscriber list at the moment");
  return res
    .status(200)
    .json(new ApiResponse(200, channelList, "fetched list successfully"));
});

export {
  checkIsSubscribed,
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
