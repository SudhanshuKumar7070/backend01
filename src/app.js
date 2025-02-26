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
 app.use("/api/v1/users",userRouter)

 
export {app}
// app.get('/',(req,res)=>{
// res.send("hello world")
// })
// const PORT = process.env.PORT || 3000;
// app.listen(PORT,()=>{        ---> this can be one  of the way , but when we work on production based 
// web apps server should listen after data base connection
//     console.log("app is running at port",PORT );
    
// })

