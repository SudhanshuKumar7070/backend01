import { Tweet } from "../models/tweet.model.js";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
/* TASK FOR THIS CONTROLLER

 * 

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})
 *

 */
const createTweet = AsyncHandler(async (req, res) => {
  const id = req.user._id;
  if (!id) throw new ApiError(400, "unauthorised user !");
  const { content } = req.body;
  if (!content || content === "" || content === undefined || content === null) {
    throw new ApiError(400, " content not found");
  }
  const tweet = await Tweet.create({
    content,
    owner: id,
  });
  if (!tweet) throw new ApiError(400, "error in creating tweet ");
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "created tweet successfully"));
});

const updateTweet = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiResponse(400, "can't get tweet id from  params");
  const { content } = req.body;
  if (!content) throw new ApiError("content field required");
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) throw new ApiError(400, " update failed");
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, " updated sucessfully"));
});

const deleteTweet = AsyncHandler(async (req, res, next) => {
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "tweetId id is required");
  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });
  if (!deletedTweet)
    throw new ApiError(500, "Tweet not deleted or unauthorised action");
  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, " tweet deleted successfully"));
});

const getUserTweets = AsyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "asc",
  } = req.query;

  // const tweets = await Tweet.find({owner:req.user._id});
  //  if( !tweets ) throw new ApiError(500,"tweets are not available at the moment or unauthorised action");
  //  return res.status(200).json( new ApiResponse(200, tweets,"fetched successfully")) ;
  // method 2 , for btter pagination

  const pageNo = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNo = parseInt(limit) > 0 ? parseInt(limit) : 10;

  const skip = (pageNo - 1) * limitNo;

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: req.user?._id,
      },
    },
  ])
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limitNo)
    .toArray();
  if (!tweets)
    throw new ApiError(
      500,
      "tweets are not available at the moment or unauthorised action"
    );
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "fetched successfully"));
});
const listAllTweets = AsyncHandler(async (req, res, next) => {
  //  const tweets = await Tweet.find();
  //  if(!tweets) throw new ApiError(500,"error in fetching tweets !");
  //  return res.status(200,tweets,"tweets fetched successfully");
  const {
    page = 1,
    limit = 10,

    sortType = "asc",
    sortBy = "createdAt",
  } = req.query;
  //  if ( !userId.trim()) throw new ApiError(400,"user id not found") ;
  const pageNo = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNo = parseInt(limit) > 0 ? parseInt(limit) : 10;
  const skip = (pageNo - 1) * limitNo;
  const tweet = await Tweet.find()
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip(skip);
    
  if (!tweet) throw new ApiError(500, "error in fetching tweets !");
  return res.status(200).json(new ApiResponse(200,tweet,"tweet fetched sucsessfully"));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets, listAllTweets };
