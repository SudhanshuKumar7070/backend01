import mongoose from "mongoose";

import { Comment } from "../models/comment.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";

const getVideoComments = AsyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "asc",
  } = req.query;
  const pageNo = parseInt(page) > 0 ? parseInt(page) : 1;
  const limitNo = parseInt(limit) > 0 ? parseInt(limit) : 1;
  const skip = (pageNo - 1) * limitNo;
  if (!videoId) throw new ApiError(404, "videoID is not available");
  const comments = await Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNo,
    },
  ]);

  if (!comments || comments.length === 0)
    throw new ApiError(404, "No comments available for the specified video");

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched sucessfully"));
});

const addComment = AsyncHandler(async (req, res) => {
  // TODO: add a cent to a video
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new ApiError(400, "Invalid video ID");
  if (!videoId.trim())
    throw new ApiError(400, " videoID is  missing, can't add comment ");
  const { comment } = req.body;
  if (!comment) throw new ApiError(400, " required comment field");
  const newComment = await Comment.create({
    content: comment,
    owner: req?.user?._id,
    video: new mongoose.Types.ObjectId(videoId),
  });
  if (!newComment)
    throw new ApiError(400, " unable to create comment at the moment");

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "comment added sucessfully"));
});

const updateComment = AsyncHandler(async (req, res) => {
  // TODO: update omment

  const { comment } = req.body;
  const { commentId } = req.params;
  if (!commentId || !commentId.trim())
    throw new ApiError(400, "Comment ID is required and cannot be empty");

  if (!mongoose.Types.ObjectId.isValid(commentId))
    throw new ApiError(400, "Invalid comment ID");
  const req_id = new mongoose.Types.ObjectId(commentId);
  if (!commentId.trim())
    throw new ApiError(
      400,
      "unable to edit comment at the moment, comment id  is not found"
    );
  const updatedComment = await Comment.findByIdAndUpdate(req_id, {
    $set: {
      content: comment,
    },
  });

  if (!updatedComment) throw new ApiError(400, "Comment not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated sucessfully"));
});

const deleteComment = AsyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId || !commentId.trim())
    throw new ApiError(400, "Comment ID is required and cannot be empty");

  if (!mongoose.Types.ObjectId.isValid(commentId))
    throw new ApiError(400, "Invalid comment ID");
  const req_id = new mongoose.Types.ObjectId(commentId);
  const deletedComment = await Comment.findByIdAndDelete(req_id);
  if (!deletedComment)
    throw new ApiError(404, "can't delete comment at the moment");
  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "commnt deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
