//manages all the errors 
export const errorHandler = (err, req, res, next) =>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.log(`[ERROR]: ${err.message}`);
    
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};