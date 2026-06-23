export const maxValidator = (value, maxVal) => {
    if (value === undefined || value === null || value === '') return null;
    
    if (Array.isArray(value)) {
        return value.length > maxVal ? `SELECT MAXIMUM ${maxVal} OPTIONS.` : null;
    }
    
    const num = Number(value);
    if (!isNaN(num)) {
        return num > maxVal ? `VALUE MUST BE LESS THAN OR EQUAL TO ${maxVal}.` : null;
    }
    
    return String(value).length > maxVal ? `MAXIMUM LENGTH IS ${maxVal} CHARACTERS.` : null;
};
