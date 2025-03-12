import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/videos.model.js";
import mongoose from "mongoose";
import { UploadFileToCloudinary } from "../utils/CloudinaryFileUpload.js";
// import { getVideoDurationInSeconds } from "get-video-duration";
// import path from "path";
// import { unescape } from "querystring";
// import { raw } from "express";

// const formatVideoDuration = (seconds) => {
//   const hrs = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);

//   return hrs * 10000 + mins * 100 + secs;
// };

const uploadVideo = AsyncHandler(async (req, res, next) => {
  /**steps of working
     * get all required fields from user and verify them
     * uplod video to local file using multer
     * find video duration
     * upload video to cloudinary and get a video file link
     * --task is to calculate duration of video
     
     */
  const { title, description } = req.body;
  if ([title, description].some((fields) => fields.trim() === ""))
    throw new ApiError(400, "title and description are required ");
  //  console.log('title:',title, " description:", description);

  // getting local file of video
  const videoLocalfile = req.files.videoFile[0]?.path;
  const thumbnailLocalfile = req.files.thumbnail[0]?.path;
  if (!videoLocalfile) {
    throw new ApiError(400, "videoFile is  not uploaded through multer");
  }
  if (!thumbnailLocalfile)
    throw new ApiError(400, "videoFile is  not uploaded through multer");
  // const videoPath = path.normalize(videoLocalfile);
  // const thumbnailPath = path.normalize(thumbnailLocalfile);
  // const videoDuration = await getVideoDurationInSeconds(videoPath);
  // if (!videoDuration)
  //   throw new ApiError(400, "error in calculating video duration");
  // const formattedVideoDuration = formatVideoDuration(videoDuration);
  const cloudinaryVideoPath = await UploadFileToCloudinary(videoLocalfile);
  console.log("video data to get duration from here_:", cloudinaryVideoPath);
  console.log(" AND GET DURATION FROM HERE:", cloudinaryVideoPath.duration);

  if (!cloudinaryVideoPath.url)
    throw new ApiError(
      400,
      "video file is not available at cloudinary || video not uplaoded"
    );
  const cloudinaryThumbnailPath = await UploadFileToCloudinary(
    thumbnailLocalfile
  );

  if (!cloudinaryThumbnailPath)
    throw new ApiError(400, " error in uploading thumbnail to cloudinary");

  const video = await Video.create({
    videoFile: cloudinaryVideoPath?.url,
    thumbnail: cloudinaryThumbnailPath?.url,
    duration: cloudinaryVideoPath?.duration,
    title,
    description,
    owner: req.user?._id,
  });
  console.log("video document created::", video);

  if (!video) throw new ApiError(400, "video not uploaded");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uplaod successfull"));
});

/*****  *     **controller for updating video details *** */
// const updateVideo = AsyncHandler(async (req, res) => {
//   const { videoId } = req.params
//   const { title, description } = req.body;
//   //TODO: update video details like title, description, thumbnail
//   if ( !videoId.trim()) throw new ApiError(404, "videoId is mandatory filed , missing videoId");
//      if ([ title, description ].some(field=> field.trim() ==="")) throw new ApiError(404, " all fields are mandatory ! ");

// })
//  instead of updating each field once it's better to delete or update only required fields so its better to maintain a new
// routes deprately for fields updation,
const updateVideoThumbnail = AsyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  const thumbnail = req.file?.path;
  if (!videoId.trim()) throw new ApiError(404, "video id is not found!");
  if (!thumbnail)
    throw new ApiError(404, "unable to upload thumbnai via multer!");
  const cloudinaryThumbnailPath = await UploadFileToCloudinary(thumbnail);
  if (!cloudinaryThumbnailPath)
    throw new ApiError("error in uploading new image to cloudinary");

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { thumbnail: cloudinaryThumbnailPath.url },
    },
    {
      new: true,
    }
  );
  if (!video)
    throw new ApiError(400, "unable to find and update field of video");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "thumbnail updated successfully"));
});
const updateVideoTitle = AsyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  const { title } = req.body;
  if (!videoId.trim()) throw new ApiError(404, "video id is not found!");
  if (!title)
    throw new ApiError(
      404,
      " unable to find title | all fields are required !"
    );

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { title: title },
    },
    {
      new: true,
    }
  );
  if (!video)
    throw new ApiError(400, "unable to find and update field of video");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "title updated successfully"));
});
const updateVideoDescription = AsyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  const { description } = req.body;
  if (!videoId.trim()) throw new ApiError(404, "video id is not found!");
  if (!description)
    throw new ApiError(
      404,
      " unable to find description | all fields are required !"
    );

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: { description: description },
    },
    {
      new: true,
    }
  );
  if (!video)
    throw new ApiError(400, "unable to find and update field of video");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "description updated successfully"));
});

const deleteVideo = AsyncHandler(async (req, res, next) => {
  //   const _id= req.body._id;
  // ISSUE::::Any logged user can delete video,,but only owners should have access of deletetion of video
  // solution:: match current id with owners id ,if mathched -> delete , else->return error (used:: findOneAndDelete() method)
  const { VideoId } = req.params;

  if (!VideoId) throw new ApiError(400, "id not found");

  const deletedVideo = await Video.findOneAndDelete({
    _id: VideoId,
    owner: req.user._id,
  });
  if (!deletedVideo)
    throw new ApiError(
      400,
      "video is not deleted or you are not authorised to delete video"
    );
  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));
});
//TODO: more to think upon:
/*Get Video Details: Retrieve details of a specific video.
 * Get All Videos: Retrieve a list of all videos, with pagination.
 * Update Video Details: Allow the owner to update video details such as the title, description, and thumbnail.
 * Search Videos: Search for videos based on keywords.
 * Like/Dislike Video: Allow users to like or dislike a video.
 * Comment on Video: Allow users to comment on a video.
 * Get Comments: Retrieve comments for a specific video.
 */

const getVideoById = AsyncHandler(async (req, res, next) => {
  const { videoId } = req.params;
  // if you are login ,then only you can access the video details-> use verify token in router
  if (!videoId.trim()) throw new ApiError(400, "can't find video id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "can't fetch video details");

  return res
    .status(200)
    .json(
      new ApiResponse(
        new ApiResponse(200, video, "fetched video data succesfully")
      )
    );
});
/* *ASSIGNMENT VIDEO CONTROLLERS */

/**const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
}) */

const getAllVideos = AsyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    // userId,
    // _id
  } = req.query;
  const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
  const pageLimit = parseInt(limit) > 0 ? parseInt(limit) : 10;
  // if (
  //   [userId].some(
  //     (field) => field.trim() === "" || field === undefined || field === null
  //   )
  // )
  // if(!userId)
  // if(!_id)
  //  {
  //    throw new ApiError(400, "unable to fetch video, userId is essential ");
  //  }
  const searchableQuery = query ? new RegExp(query, "i") : null;
  //  page = 2; // Example: Retrieve the second page
  //  limit = 10; // Number of documents per page
  const skip = (pageNumber - 1) * pageLimit; // this is for handle , data in different pages , i.e for pagination

  // const videoQuery = {
  //   $and: [
  //     { _id }, // Ensure the userId is always part of the query
  //     {
  //       $or: [
  //         { title: { $regex: searchableQuery || ".*", $options: "i" } }, // Match title if query exists
  //         { description: { $regex: searchableQuery || ".*", $options: "i" } }, // Match description if query exists
  //       ],
  //     },
  //   ],
  // };

  const videoQuery = {
      $or:[
        { title: { $regex: searchableQuery || ".*"} }, // Match title if query exists
          { description: { $regex: searchableQuery || ".*"} }, // Match description if query exists
      ]

      
  }
  const videos = await Video.find(videoQuery)
     .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
     .skip(skip)
     .limit(limit)
    //  .toArray();
console.log('video is founded with following details:;;;;;;;;;:::::::>',videos);

  if (!videos || videos.length === 0) throw new ApiError(400, "video not found! ");
    
  return res.status(200).json(new ApiResponse(200, videos, "video fetched successfully"));
});

//  This controller is for search fuctionality , it takes query and searches for that in title and description
//  moreover we can improve it for finding user name  i,e, if you search for any username in searchbar , it can returrn  output easily
const getUserVideo = AsyncHandler(async(req,res,next)=>{
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "asc",
    userId,
  } = req.query;
  console.log('getting userId',userId);
  
  const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
  const pageLimit = parseInt(limit) > 0 ? parseInt(limit) : 10;
  const searchableQuery = query ? new RegExp(query, "i") : null;
  const skip = (pageNumber - 1) * pageLimit;
   const videoQuery = {
     $or:[
       { title: { $regex: searchableQuery || ".*"} }, // Match title if query exists
         { description: { $regex: searchableQuery || ".*"} }, // Match description if query exists
        //  {userDetails._i:userId}
     ],
     
 }

const videos = await Video.aggregate([
   {$lookup:{
     from:"users",
     localField:"owner",
     foreignField:"_id",
     as:"userDetails"
   }},
   {
    $addFields:{
      userDetails:{
        $arrayElemAt: ["$userDetails", 0]
      }
    }
   },{
    // $match: { "userDetails._id": new mongoose.Types.ObjectId(userId) }
    $match: videoQuery
   },
   {
    $project:{
      "videoFile":1,
      "duration":1,
      "thumbnail":1,
      "title":1,
      "userDetails.fullName":1,
      "userDetails.userName":1,
      "userDetails.email":1,
      "userDetails.coverImage":1,
      "userDetails.avatar":1
      // "userDetails.":1,
      
    }
   }
]).sort({[sortBy]: sortType==="asc"?1:-1}).skip(skip)
// console.log( "video after getUserQuerry:",videos);
if (!videos || videos.length === 0) throw new ApiError(400, "video not found! ");
   
  return res.status(200).json(new ApiResponse(200, videos, "video fetched successfully"));
});

 


//  controller for  togelling publish status video

const togglePublishStatus = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  if (!videoId.trim()) throw new ApiError(400, "can't find videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "error in fetching video details from db");
     console.log('user._id::', req.user._id,"|| video ka owner::", video.owner );
     
     
//  publish and unpublish option should only available for owner of video
if (String(video.owner) !== String(req.user._id)) {
  throw new ApiError(500, "unauthorised action");
}
  const updatedPublishState = !video.isPublished;

  const updatePublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: updatedPublishState,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePublish)
    throw new ApiError(400, "unable to toggle Publish status");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePublish, "the publish status updated!")
    );
});


export {
  uploadVideo,
  deleteVideo,
  getVideoById,
  getAllVideos,
  updateVideoThumbnail,
  updateVideoTitle,
  updateVideoDescription,
  togglePublishStatus,
  getUserVideo
};
