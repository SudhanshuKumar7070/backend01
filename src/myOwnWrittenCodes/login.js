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
  
    const verifiedPassword = await existedUser?.isCorrectPassword(password);
    if (!verifiedPassword) {
      throw new ApiError(400, "invalid password");
    }
    const acessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.generateRefreshToken();
    res.cookie("acessToken", acessToken, {
      httpOnly: true,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    existedUser.refreshTokens = refreshToken;
    existedUser.accessTokens = acessToken;
  
    await existedUser.save(); //Save updated user with new tokens
    // search for update
  
    const userLog = await User.findOne({
      $or: [{ refreshTokens: refreshToken }, { userName: existedUser.userName }],
    }).select("-password -refreshTokens -accessTokens");
    console.log("userLog at end:", userLog);
  
    if (!userLog) {
      throw new ApiError(500, " error in login user ");
    }
  
    res.status(201).json(new ApiResponse(200, userLog, "Login successful"));
  });