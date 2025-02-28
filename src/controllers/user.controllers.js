import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UploadFileToCloudinary } from "../utils/CloudinaryFileUpload.js";
import jwt from "jsonwebtoken";

/*a general method for creating access tokens and  refresh tokens*/

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(500, "something went wrong in  creating tokens");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.log("error in generating tokens");
    throw new ApiError(400, err.message);
  }
};

const registerUser = AsyncHandler(async (req, res) => {
  /***********STEPS REQUIRED DURING REGISTER******
     * 1.Take Data like email-id full-name, username, password from user via req.body,from frontend,take image 
       from user - using frontend , in which user can  upload image ,
       . store image temproarily in local server
     * 2. apply validations to user details - - like  for empty or null data,format of email is accurate or not
     * 3. check if user is already exists or not
     * 4. check if images are there or not 
     * 5. if present, upload the image to cloudinary', and get url from response of cloudinary utils function
     * 6.create user object - create entry in database -- have to learn db calls
     * 7.remove password and refresh token from response 
     * 8.check for user creation
     * 9.return response.
     
     */

  const { fullName, email, password, userName } = req.body;

  //  we can not directly handle images or directly accepts image files there..
  console.log("password: ", password);
  /*  old method--
   //  checking for all required fields
      if (!email || !userName || !password || !fullName ){
        return res.status(402).json({
            message:"all fields are required"
        })
      }

    //    checking for empty fields
        if(email ==""|| password ==""|| userName ==""|| fullName==""){
          return res.status(400).json({
            message:"none field should be empty"
          })
        }

        */

  // new method--

  if (
    [fullName, email, password, userName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required ");
  }

  //  checking if email is already registered or not
  const currentUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (currentUser) {
    throw new ApiError(400, "user already exists with same email or username");
  }
  // handle image files and other files by using middleware
  const avatarImagePath = req.files?.avatar[0]?.path;
  console.log(
    "information about avatar , uplaoded using multer:",
    avatarImagePath
  );
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(
    "information about avatar , uplaoded using multer:",
    coverImageLocalPath
  );
  if (!avatarImagePath || !coverImageLocalPath) {
    throw new ApiError(
      400,
      "missing avatar image or cover image  ,upload avatar image first"
    );
  }

  const avatarCloudinaryUrl = await UploadFileToCloudinary(avatarImagePath);
  const coverImageCloudinaryUrl = await UploadFileToCloudinary(
    coverImageLocalPath
  );
  /* checking if the avatar and cover image file uplaoaded to cloudinary or not,
    if yes uplaod it to database else throw error */
  if (!avatarCloudinaryUrl || !coverImageCloudinaryUrl) {
    throw new ApiError(400, "images are not uploaded to cloudinary");
  }
  console.log(
    "coverImageCloudinaryUrl:",
    coverImageCloudinaryUrl.url,
    " && avatar url: ",
    avatarCloudinaryUrl.url
  );
  // uplpload image to db

  // const hashedPassword = await bcrypt.hash(password, 10);--- not need to do this step here because we used mongoose middleware to encrypt password
  // const user = new User({
  //   email,
  //   password: hashedPassword,
  //   userName,
  //   fullName,
  // });
  // await user.save();
  /** creating user object to make entries in database */
  const user = await User.create({
    fullName,
    avatar: avatarCloudinaryUrl.url,
    coverImage: coverImageCloudinaryUrl.url,
    email,
    userName: userName.toLowerCase(),
    password,
  });
  // res.status(200).json({
  //   messagge: "ok",
  // });

  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );
  if (!createdUser) {
    throw new ApiError(500, " error in registring user ");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, " user created sucessfully "));
});

/* *steps for login
 1. get email and password from user, verify for null field ,

 2. check if user already exists or not for same email

 3. compare password from existing password

 4.create  token  and return to user
 
 5.check whether it is updated in db or not


*/

const LoginUser = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("email at login:", email);

  if (!email || !password) {
    throw new ApiError(500, "all fields are required");
  }
  const existedUser = await User.findOne({
    email,
  });
  console.log("existed user kya hota hai:", existedUser);
  if (!existedUser) {
    throw new ApiError(400, "user not exists");
  }

  const verifiedPassword = await existedUser.isCorrectPassword(password);
  if (!verifiedPassword) {
    throw new ApiError(400, "invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existedUser._id
  );

  const loggedUser = await User.findById(existedUser._id).select(
    " -password  -refreshToken "
  );
  if (!loggedUser)
    throw new ApiError(500, "something went wrong in finding logged user");
  console.log("loggedUser found!", loggedUser);

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "login successfull"
      )
    );

  // const acessToken = existedUser.generateAccessToken();
  // const refreshToken = existedUser.generateRefreshToken();
  // res.cookie("acessToken", acessToken, {
  //   httpOnly: true,
  //   expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  //   secure: process.env.NODE_ENV === "production",
  // });
  // res.cookie("refreshToken", refreshToken, {
  //   expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  // });
  // existedUser.refreshTokens = refreshToken;
  // existedUser.accessTokens = acessToken;

  // await existedUser.save(); //Save updated user with new tokens
  // // search for update

  // const userLog = await User.findOne({
  //   $or: [{ refreshTokens: refreshToken }, { userName: existedUser.userName }],
  // }).select("-password -refreshTokens -accessTokens");
  // console.log("userLog at end:", userLog);

  // if (!userLog) {
  //   throw new ApiError(500, " error in login user ");
  // }

  // res.status(201).json(new ApiResponse(200, userLog, "Login successful"));
});
/*  *Steps for logout user'
-> basic is to delete tokens from both client and server
  
 */
const LogoutUser = AsyncHandler(async (req, res, next) => {
  //  step -1 => search for refresh token from access token and make access token undefined
  const currentUser = req.user;
  if (!currentUser) {
    throw new ApiError(401, " user not available");
  }
  await User.findByIdAndUpdate(
    currentUser._id,
    {
      $set: {
        refreshTokens: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(202, {}, "logout sucessfull"));
});
/* here we generate access token using refressh token , if access token gets expired */

/* *steps of working - 
1. get refresh token from users cookies 
2. decode it by using jwt
-> get all data from token, 
- here we get an id which we sent  to client via token 
- use that id and find out corresponding user for that

3.generate new access token ,
4. send it to client via new cookies
  
*/

const getNewAccessToken = AsyncHandler(async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!oldRefreshToken) {
    throw new ApiError(400, "refresh token not found");
  }
  // decoding the data of refresh token
  const decodedData = jwt.verify(
    oldRefreshToken,
    process.env.SECRET_KEY_REFRESH_TOKEN
  );
  if (!decodedData) throw new ApiError(401, "unauthorised user");
  const user = await User.findById(decodedData?._id);
  console.log("user found:", user);

  if (!user) throw new ApiError(401, "invalid refresh token");
  // matching old_incoming_refresh token from the existed ones
  console.log(
    "old refresh token:",
    oldRefreshToken,
    "<-and->",
    user.refreshTokens
  );

  if (oldRefreshToken !== user.refreshTokens)
    throw new ApiError(401, "refresh token is not authorised");

  const options = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          refreshToken: newRefreshToken,
          accessToken: accessToken,
          compare: "compare here",
          old: oldRefreshToken,
        },
        "acess token generated and sent successfully"
      )
    );
});
// change password method

/** it is possible iff user is login 

 */

const UpdateCurrentPassword = AsyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user)
    throw new ApiError(401, "unauthorised access || user is not login");
  // checking is old password matches the password from database
  const isCorrectPassword = await user.isCorrectPassword(oldPassword);
  if (!isCorrectPassword) throw new ApiError(401, " invalid previous password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated successfully"));
});
// special endpoint get current user data if user is login
const currentLoggedinUser = AsyncHandler(async (req, res, next) => {
  // if user is logged in , then it has access of .user object that we created in middleware
  const currentUser = req.user;
  if (!currentUser) throw new ApiError(400, "unauthorised access");
  // const user = await User.findById(currentUser._id).select(" -password -refreshToken ")
  // if(!user) throw new ApiError(401,"something went wrong in finding error");--<not needed>
  res.status(200).json(200, currentUser, "fetched user data successfully");
});

//   controllers for updat fullName and password -_> kewal , person can do all the stuf

const updateFullName = AsyncHandler(async (req, res, next) => {
  const { fullName } = req.body;
  console.log("getting fullName at request:", fullName);

  if (!fullName)
    throw new ApiError(401, "full name is not getting available at server");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName },
    },
    {
      new: true,
    }
  ).select(" -password -refreshToken");
  // console.log('finded user for updating full name', user);
  if (!user) throw new ApiError(402, "invalid user authorisation");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "full name updated successfully"));
});

// controller for updating email
const updateEmail = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new ApiError(401, "invalid email");
  console.log("getting email after request", email);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { email } },
    { new: true }
  ).select("-password -refreshToken");
  console.log("finded user for updating email", user);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "email updated successfuly"));
});
//   controller for updating avatar image
/*
->----steps for updating avatar image-----
 upload image to local ,
 check if image is available or not 
 upload it to cloudinary , get link
 find user from database from logged user id,
 update in database
 
*/
const updateAvatarImage = AsyncHandler(async (req, res, next) => {
  const localAvatarfile = req.files?.avatar[0]?.path;
  if (!localAvatarfile) throw new ApiError(400, "avatar is not uploaded ");
  // upload to cloudinary
  const cloudinaryAvatarPath = await UploadFileToCloudinary(localAvatarfile);
  // console.log('cloudinaryAvatarPath ::',cloudinaryAvatarPath );

  if (!cloudinaryAvatarPath)
    throw new ApiError(400, "avatar is not uploaded on cloudinary");
  console.log("req.user?._id:::::<><<>", req.user?._id);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: cloudinaryAvatarPath.url } },
    { new: true }
  ).select("-password -refreshToken");
  console.log('user at updateAvatarImage""""', user);

  if (!user) throw new ApiError(400, "user not found");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

// controller for updating cover image

const updateCoverImage = AsyncHandler(async (req, res, next) => {
  const localCoverImagePath = req.files?.coverImage[0]?.path;
  if (!localCoverImagePath)
    throw new ApiError(400, "Cover Image is not uploaded ");
  // upload to cloudinary
  const cloudinaryCoverImagePath = await UploadFileToCloudinary(
    localCoverImagePath
  );
  // console.log('cloudinaryAvatarPath ::',cloudinaryAvatarPath );

  if (!cloudinaryCoverImagePath)
    throw new ApiError(400, "coverImage is not uploaded on cloudinary");
  //  console.log('req.user?._id:::::<><<>',req.user?._id);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: cloudinaryCoverImagePath.url } },
    { new: true }
  ).select("-password -refreshToken");
  console.log('user at updateCoverImage""""', user);

  if (!user) throw new ApiError(400, "user not found");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

export {
  registerUser,
  LoginUser,
  LogoutUser,
  getNewAccessToken,
  UpdateCurrentPassword,
  currentLoggedinUser,
  updateFullName,
  updateEmail,
  updateAvatarImage,
  updateCoverImage,
};
