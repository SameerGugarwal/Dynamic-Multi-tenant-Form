/*
// --- User's Original Code ---
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
// --- End User's Original Code ---
*/

import { errorResponse } from '../shared/utils/apiResponse.mjs';
import { AppError } from '../shared/utils/errors.mjs';

// Updated Error Handler using AppError evaluation
export const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        // Trusted operational exception
        statusCode = err.statusCode;
        message = err.message;
    } else {
        // Unhandled system crash or DB error
        statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        message = err.message || 'Internal Server Error';
        console.error(`[UNHANDLED ERROR]: ${err.stack}`);
    }
    
    const errors = process.env.NODE_ENV === 'production' ? null : err.stack;
    
    return errorResponse(res, statusCode, message, errors);
};