import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UploadFileToCloudinary } from "../utils/CloudinaryFileUpload.js";
const registerUser = AsyncHandler(async (req, res) => {
  /***********STEPS REQUIRED DURING REGISTER******
     * 1.Take Data like email-id full-name, username, password from user via req.body,from frontend,take image 
     * from user - using frontend , in which user can  upload image ,
     * . store image temproarily in local server
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
    throw new ApiError(409, "user already exists with same email or username");
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

    userName: userName.toLowerCase(),
    password,
  });
  res.status(200).json({
    messagge: "ok",
  });

  const createdUser = user
    .findById(user._id)
    .select(" -password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, " error in registring user ");
  }
  // return new ApiResponse(200, createdUser, " user created sucessfully ");
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, " user created sucessfully "));
});
export { registerUser };
