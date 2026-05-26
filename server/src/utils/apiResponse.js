const getresponse = (res,statusCode,success,message,data = null) =>{
    return res.status(statusCode).json({
        success : successCode <400,
        message : message,
        data : data
    });
};

module.exports = getresponse;
