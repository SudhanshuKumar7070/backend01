  const AsyncHandler = (fn)=>async( req, res,next)=>{

     try{
        await fn(req,res,next)
     }
     catch(error){
      res.status(error || 500).json({
        sucess:false,
        message:error.message
      })

     }

  }


  export  {AsyncHandler}