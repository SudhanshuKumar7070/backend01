const togglePublishStatus = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId.trim()) throw new ApiError(400, "can't find videoId");
  const video = await Video.findById(videoId);
  if (!video)
    throw new ApiError(400, "error in fetching video details from db");
  // togelling publish
  // console.log('video data:', video);
  // return res.status(200);
  if (video.isPublished) {
    console.log("before toggle::>", video.isPublished);

    const updatePublish = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: false,
        },
      },
      {
        new: true,
      }
    );
    if(!updatePublish) throw new ApiError(400,"unable to toggle Publish status")
    // console.log('After toggle::>', video.isPublished , " returned value:::>",updatePublish);
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatePublish, "the video is set to unpublished")
      );
  } else {
    console.log("before toggle::>", video.isPublished);

    const updatePublish = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: true,
        },
      },
      {
        new: true,
      }
    );
    //  console.log('After toggle::>', video.isPublished , " returned value:::>",updatePublish);
    if(!updatePublish) throw new ApiError(400,"unable to toggle Publish status")
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatePublish, "the video is set to published")
      );
  }
});