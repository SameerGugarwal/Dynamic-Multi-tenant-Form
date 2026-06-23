/*
// --- User's Original Code ---
export const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};
// --- End User's Original Code ---
*/

export const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data !== null && { data }) // Only attach 'data' key if data exists
    });
};

export const errorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== null && { errors }) // Only attach 'errors' key if stack trace exists
    });
};

export const paginatedResponse = (res, statusCode, message, data, pagination) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        pagination
    });
};
