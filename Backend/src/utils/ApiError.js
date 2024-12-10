class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went Wrong",
        errors=[],
        statck=""
    ){
       super(message)
       this.statusCode=statusCode
       this.data=null  // read documentation why?
       this.message=message
       this.success=false;
       this.errors=errors
       if(statck){
        this.statck=statck
       }
       else{
        Error.captureStackTrace(this,this.constructor)
       }
    }
}

export {ApiError}