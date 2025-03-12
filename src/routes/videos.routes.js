import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

import {
    uploadVideo,
    deleteVideo ,
    getVideoById,
    updateVideoThumbnail,
    updateVideoDescription,
    updateVideoTitle,
    togglePublishStatus,
    getAllVideos,
    getUserVideo
    // ListAllVideos
    // "videoFile"
} from "../controllers/video.controllers.js";
const videoRouter = Router();
  videoRouter.route("/upload").post(
    verifyJWT, upload.fields([
      {
        name:"videoFile",
        maxCount:1
      },
      {
        name:"thumbnail",
        maxCount:1
      }
    ]),uploadVideo
  )
  videoRouter.route("/delete-video/:VideoId").post(
    verifyJWT,deleteVideo 
  )
   videoRouter.route("/video").get( verifyJWT,getAllVideos)
   videoRouter.route("/getUserVideo").get( verifyJWT,getUserVideo)

  //  route for get video by id
   videoRouter.route("/video_details/:videoId").get(verifyJWT,getVideoById);
//   routes for perform updation in fields video
  videoRouter.route("/update_thumbnail/:videoId").patch(verifyJWT, upload.single("thumbnail"),updateVideoThumbnail)
   videoRouter.route("/update_video_title/:videoId").patch(verifyJWT,updateVideoTitle);
   videoRouter.route("/update_video_description/:videoId").patch(verifyJWT,updateVideoDescription);
   videoRouter.route("/update_publish_state/:videoId").patch(verifyJWT,togglePublishStatus);
 
export default videoRouter