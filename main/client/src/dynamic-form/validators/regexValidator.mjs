export const regexValidator = (value, pattern, customMessage) => {
    if (!value || !pattern) return null; // Let required validator handle empty values
    const regex = new RegExp(pattern);
    if (!regex.test(String(value))) {
        return customMessage || 'INVALID FORMAT.';
    }
    return null;
};
