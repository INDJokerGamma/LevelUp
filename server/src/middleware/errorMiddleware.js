const notfound = (req, res, next) =>{
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler =( err, req, res, next)=>{
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    
    if(err.name === "CastError"){
        statusCode = 404;
        message = "Resource not Found";
    }

    if(err.code === 11000){
        statusCode = 409;
        message = "Field Vlaue already Present";
    }

    if(err.code ==="ValidationError"){
        statusCode = 400;
        message = Object.values(err.errorrs).map((item) => item.message).join(", ");
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? null :err.stack,
    });
};

module.export ={
    notfound,
    errorHandler,
};