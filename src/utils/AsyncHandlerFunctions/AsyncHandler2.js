const AsyncHandlerSecond =( requestHandler)=>{
   promise.resolve( requestHandler(req,res,next)).catch((err)=>next(err))
}
export default {AsyncHandlerSecond}

// NOTE- we can use either  one of the two methods for our task