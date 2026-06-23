export const generateId = (prefix = 'ID') => {
    return prefix + '_' + Math.random().toString(36).substr(2, 9);
};
