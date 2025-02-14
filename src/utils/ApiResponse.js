class ApiResponse{
  constructor( statusCode,data, message="Success"){
 this.statusCode= statusCode;
 this.message=message;
 this.data = statusCode < 400;
  }
}

export {ApiResponse}