import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
// basic function of this middleware is to verify access token at login  route
export const verifyJWT = AsyncHandler(async (req, res, next) => {
  const currentUserToken =
    req.cookies.accessToken ||
    req.header("Authorisation")?.replace("Bearer ", "");
 
    console.log('access token mil gaya: ', currentUserToken);
    
  if (!currentUserToken) {
    throw new ApiError(400, "Unauhtorised user ! ");
  }
  // decode tokens
  const decodedToken = jwt.verify(
    currentUserToken,
    process.env.SECRET_KEY_ACCESS_TOKEN
  );
  if (!decodedToken) {
    throw new ApiError(400, "invalid user || token not matched");
  }
  //  make a db call , to find user by tokens ki id

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  
  console.log('user at middleware:::>', user);
  
  if (!user) throw new ApiError(401, "invalid access token");

  req.user = user;
  next();
});
