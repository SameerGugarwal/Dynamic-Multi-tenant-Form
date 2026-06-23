export const minValidator = (value, minVal) => {
    if (value === undefined || value === null || value === '') return null;
    
    // Check array length (checkboxes)
    if (Array.isArray(value)) {
        return value.length < minVal ? `SELECT AT LEAST ${minVal} OPTIONS.` : null;
    }
    
    // Check number values
    const num = Number(value);
    if (!isNaN(num)) {
        return num < minVal ? `VALUE MUST BE GREATER THAN OR EQUAL TO ${minVal}.` : null;
    }
    
    // String length fallback
    return String(value).length < minVal ? `MINIMUM LENGTH IS ${minVal} CHARACTERS.` : null;
};
