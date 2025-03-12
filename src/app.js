import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = express()

// setting up middlewares 

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
 
}))

app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({ extended:true, limit:"16kb" }))

app.use(express.static("public"))

 app.use(cookieParser())

 // import router and use it as a middleware
 import userRouter  from "./routes/user.routes.js"
 import videosRouter from "./routes/videos.routes.js"
 import tweetRouter from "./routes/tweet.routes.js"
 import dasboardRouter from "./routes/dashboard.route.js"
 import likesRouter from "./routes/likes.routes.js"
 import healthCheckRouter from "./routes/healthCheckRoute.js"
 app.use("/api/v1/users",userRouter)
 app.use("/api/v1/videos",videosRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/dash_board",dasboardRouter)
app.use("/api/v1/like",likesRouter)
app.use("/api/v1/healthCheck",healthCheckRouter)
 
export {app}
// app.get('/',(req,res)=>{
// res.send("hello world")
// })
// const PORT = process.env.PORT || 3000;
// app.listen(PORT,()=>{        ---> this can be one  of the way , but when we work on production based 
// web apps server should listen after data base connection
//     console.log("app is running at port",PORT );
    
// })

