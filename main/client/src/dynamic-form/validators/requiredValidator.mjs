export const requiredValidator = (value, isRequired) => {
    if (!isRequired) return null;
    if (value === undefined || value === null || String(value).trim() === '') {
        return 'THIS FIELD IS REQUIRED.';
    }
    if (Array.isArray(value) && value.length === 0) {
        return 'AT LEAST ONE OPTION MUST BE SELECTED.';
    }
    return null;
};
