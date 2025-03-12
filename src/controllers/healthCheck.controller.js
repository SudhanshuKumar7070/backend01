
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandlerFunctions/AsyncHandler.js";
import mongoose from "mongoose";

const HealthCheck = AsyncHandler(async(req,res)=>{

    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
      };
  
     const pingOperation= await mongoose.connection.db.admin().ping();
     if(!pingOperation) {
        healthCheck.message = error.message;
        healthCheck.dbStatus = 'Disconnected';
        res.status(500).json(healthCheck);
     }
    
     healthCheck.dbStatus = 'connected';
      return res.status(200).json(new ApiResponse(200, healthCheck,"health checked succesfully"))
      

})
export {HealthCheck}