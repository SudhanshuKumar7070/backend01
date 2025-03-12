import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.model.js";
import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
// functions for checking existing likes
const isLikedVideo = async (req, contentId) => {
  const isLiked = await Like.findOne({
    video: new mongoose.Types.ObjectId(contentId),
    likedBy: req.user._id,
  });
  if (!isLiked) return false;

  return true;
};
const isLikedComment = async (req, contentId) => {
  const isLiked = await Like.findOne({
    comment: new mongoose.Types.ObjectId(contentId),
    likedBy: req.user._id,
  });
  if (!isLiked) return false;

  return true;
};

const isLikedTweet = async (req, contentId) => {
  const isLiked = await Like.findOne({
    tweet: new mongoose.Types.ObjectId(contentId),
    likedBy: req.user._id,
  });
  if (!isLiked) return false;

  return true;
};

// major controller functions
const toggleVideoLike = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId.trim())
    throw new ApiError(400, " missing videoId from params , not find videoId");
  const isVideoLiked = await isLikedVideo(req, videoId);
  if (!isVideoLiked) {
    const like = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: req.user._id,
    });
    if (!like) throw new ApiError(400, "error in liking video");
    return res
      .status(200)
      .json(new ApiResponse(200, { like: true }, "content liked successfully"));
  } else {
    const removeLike = await Like.findOneAndDelete({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: req.user._id,
    });
    if (!removeLike) throw new ApiError(400, "error in remove like from video");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { like: false },
          " removed like from content successfully"
        )
      );
  }
});
const toggleCommentLike = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId.trim())
    throw new ApiError(
      400,
      " missing commentId from params , not find commentId"
    );
  const isCommentLiked = await isLikedComment(req, commentId);
  if (!isCommentLiked) {
    const like = await Like.create({
      video: new mongoose.Types.ObjectId(commentId),
      likedBy: req.user._id,
    });
    if (!like) throw new ApiError(400, "error in liking video");
    return res
      .status(200)
      .json(new ApiResponse(200, { like: true }, "content liked successfully"));
  } else {
    const removeLike = await Like.findOneAndDelete({
      video: new mongoose.Types.ObjectId(commentId),
      likedBy: req.user._id,
    });
    if (!removeLike) throw new ApiError(400, "error in remove like from video");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { like: false },
          " removed like from content successfully"
        )
      );
  }
});

const toggleTweetLike = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId.trim())
    throw new ApiError(400, " missing tweetId from params , not find tweetId");
  const isCommentLiked = await isLikedTweet(req, tweetId);
  if (!isCommentLiked) {
    const like = await Like.create({
      video: new mongoose.Types.ObjectId(tweetId),
      likedBy: req.user._id,
    });
    if (!like) throw new ApiError(400, "error in liking video");
    return res
      .status(200)
      .json(new ApiResponse(200, { like: true }, "content liked successfully"));
  } else {
    const removeLike = await Like.findOneAndDelete({
      video: new mongoose.Types.ObjectId(tweetId),
      likedBy: req.user._id,
    });
    if (!removeLike) throw new ApiError(400, "error in remove like from video");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { like: false },
          " removed like from content successfully"
        )
      );
  }
});

const getLikedVideos = AsyncHandler(async (req, res) => {
  //TODO: get all liked videos
  // we can easily find liked video of particular user by aggregation but here we are only
  // finding liked videos of current logged in user
  const userId  = req.user._id;
  if (!userId) throw new ApiError(400, "unauthorised action ! user Id  not found");
    
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
      },
    },
    {
      $project: {
        video: 1,
      },
    },
  ]);

  if(!likedVideos || likedVideos.length ===0) throw new ApiError(404 ,"unable to fetched liked videos")
     return res.status(200).json(new ApiResponse(200, likedVideos, "liked fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
