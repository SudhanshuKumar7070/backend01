import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playList.model.js";
import mongoose from "mongoose";

const createPlaylist = AsyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;
  if ([name, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  const playList = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playList)
    throw new ApiError(400, "something went wrong in creating playlist");
  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playList created successfully"));
});

const getUserPlaylists = AsyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;
  if (!userId || !userId.trim())
    throw new ApiError(404, "user Id is not found ");
  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  if (!playlist || playlist.length === 0)
    throw new ApiError(500, "unable to find plaulist , error occured");
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const getPlaylistById = AsyncHandler(async (req, res) => {
  //TODO: get playlist by id
  const { playlistId } = req.params;
  if (!playlistId || !playlistId.trim())
    throw new ApiError(404, "user Id is not found ");
  const playlist = await Playlist.findById(playlistId);
  if (!playlist)
    throw new ApiError(500, "unable to find playlist , error occured");
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if ([playlistId, videoId].some((field) => field.trim() == "")){
    throw new ApiError(404, "playlistId or videoId is missing from params");
  }
  if (![playlistId, videoId].every(mongoose.Types.ObjectId.isValid)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }
  const req_playListId = new mongoose.Types.ObjectId(playlistId);
  const req_videoId = new mongoose.Types.ObjectId(videoId);
 const newlyUpdatedVideo = await Playlist.findByIdAndUpdate(req_playListId,{
    $addToSet:{
        videos:req_videoId
    }
 },
{
    new:true
})

//   const currentPlayist = await Playlist.findById(req_playListId);
//   if (!currentPlayist) throw new ApiError(400, "playlist doesn't exists ");
//   // Check if the video already exists in the array
//   if (currentPlayist.videos.includes(req_videoId)) {
//     throw new ApiError(400, "Video already exists in the playlist");
//   }
//   currentPlayist.videos.push(req_videoId);
//   const updatedPlaylist = await currentPlayist.save();
  if (!newlyUpdatedVideo)
    throw new ApiError(500, "something went wrong in adding video to playlist");
  return res
    .status(200)
    .json(new ApiResponse(200, newlyUpdatedVideo, "video added susessfull"));
});

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if ([playlistId, videoId].some((field) => field.trim() == "")){
    throw new ApiError(404, "playlistId or videoId is missing from params");
  }
  if (![playlistId, videoId].every(mongoose.Types.ObjectId.isValid)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }
  
  const req_playListId = new mongoose.Types.ObjectId(playlistId);
  const req_videoId = new mongoose.Types.ObjectId(videoId);
  const deletedVideo = await Playlist.findByIdAndUpdate(req_playListId,{
    $pull:{
        videos:req_videoId
    }
   
  },
  { new: true })
  if(!deletedVideo) throw new ApiError(400,"something went wrong , can't delete video from playlist");
  return res.status(200).json(new ApiResponse(200,deletedVideo,"video removed from playlist succes fully"));
  
});

const deletePlaylist = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId || !playlistId.trim())
    throw new ApiError(400, "playlistId is unavailable");
  const deletedPlaylist = await Playlist.findOneAndDelete({
    owner: req.user._id,
    _id: new mongoose.Types.ObjectId(playlistId),
  });
  if (!deletedPlaylist)
    throw new ApiError(
      404,
      "unable to delete playlist due to unauthorised action or  "
    );
  res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "playlist deletd sucessfully"));
});

const updatePlaylist = AsyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.params;
  if (!playlistId || !playlistId.trim())
    throw new ApiError(400, "playlistId is unavailable");
  const { name, description } = req.body;
  if ([name, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "name and description  are required");
  }
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      owner: req.user._id,
      _id: new mongoose.Types.ObjectId(playlistId),
    },
    {
      name: name,
      description: description,
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist)
    throw new ApiError(
      404,
      "something went wrong in updating playlist due to unauthorised action or invalid credentials"
    );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "playlist details updated successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
