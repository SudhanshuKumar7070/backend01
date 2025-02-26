  const AsyncHandler = (fn)=>async( req, res,next)=>{

     try{
       return await fn(req,res,next);
     }
     catch(err){
        return res.status(err.status||500).json({
        success:false,
        message:err.message
      })

     }
   
  }


  export  {AsyncHandler}