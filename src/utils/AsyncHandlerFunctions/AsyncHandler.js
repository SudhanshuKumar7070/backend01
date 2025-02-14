  const AsyncHandler = (fn)=>async( req, res,next)=>{

     try{
       return await fn(req,res,next)
     }
     catch(error){
        return res.status(error || 500).json({
        sucess:false,
        message:error.message
      })

     }
   
  }


  export  {AsyncHandler}