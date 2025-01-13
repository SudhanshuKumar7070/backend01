import mongoose from 'mongoose'

// mongoose connects data-base to app]
// import express from 'express'
import dotenv from 'dotenv'// it wil not work here

import connectDB from './db/index.js'

// creating a config file for dotenv
// dotenv are used to load add .env files to the whole process or program  as quickly as possible

dotenv.config({
    path:'./env'
})
connectDB();






















/***** first approach**** --.>second in db folder

import { DB_NAME } from './constants';
const app = express();

// connecting data_base by first method -using iffi{functions that execute immediately}
;(async()=>{
try{

    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

    app.error("error",(err)=>{
        console.log('ERROR-',err);
        
    })

    app.listen(process.env.PORT,()=>{
        console.log('app listening and running on port -',process.env.PORT);
        
    })
}
catch(error){
   console.log(error)
   throw(error) 
}
})()
 
*/