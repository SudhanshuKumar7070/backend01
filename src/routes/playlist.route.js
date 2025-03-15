import {Router} from "express";
import { verifyJWT } from "../middlewares/user.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    deletePlaylist,
    updatePlaylist ,
    addVideoToPlaylist,
    removeVideoFromPlaylist
    
} from "../controllers/playlist.controller.js"
const router = Router();
router.route("/create_playlist").post(verifyJWT,createPlaylist);
router.route("/user_playlist/:userId").get(verifyJWT,getUserPlaylists)
router.route("/get_playlist_by_id/:playlistId").get(verifyJWT,getPlaylistById);
router.route("/delete_playlist/:playlistId").delete(verifyJWT,deletePlaylist);
router.route("/update_playlist/:playlistId").patch(verifyJWT,updatePlaylist );
router.route("/add_video_playlist/:playlistId/:videoId").put(verifyJWT,addVideoToPlaylist );
router.route("/remove_video_playlist/:playlistId/:videoId").delete(verifyJWT,removeVideoFromPlaylist );
export default router;
