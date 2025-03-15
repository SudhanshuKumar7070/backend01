import { Router } from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
import {
    getVideoComments, addComment, updateComment, deleteComment

} from "../controllers/comment.controller.js"
  const router = Router();

 router.route("/list_all_comments/:videoId").get(verifyJWT,getVideoComments);
 router.route("/add_comments/:videoId").post(verifyJWT,addComment);
 router.route("/update_comments/:commentId").post(verifyJWT,updateComment);
 router.route("/delete_comments/:commentId").post(verifyJWT,deleteComment);

   export default router ;
 