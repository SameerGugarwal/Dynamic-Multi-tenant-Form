/*
// --- User's Original Code ---
export const getPaginationOptions = (reqQuery) => {
    const page = parseInt(reqQuery.page, 10) || 1;
    const limit = parseInt(reqQuery.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};
// --- End User's Original Code ---
*/

export const getPaginationOptions = (reqQuery) => {
    // Boundary logic: Ensure page and limit are strictly >= 1
    const page = Math.max(parseInt(reqQuery.page, 10) || 1, 1);
    const limit = Math.max(parseInt(reqQuery.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};

export const formatPagination = (total, page, limit) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};
