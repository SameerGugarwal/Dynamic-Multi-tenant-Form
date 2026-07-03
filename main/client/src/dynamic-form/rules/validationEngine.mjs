export const ValidationEngine = {
    /**
     * Validates a single question against the user's answer
     * @param {Object} question - The question schema
     * @param {any} answer - The user's answer (string, array, etc)
     * @returns {String|null} - Error message string, or null if valid
     */
    validateQuestion(question, answer) {
        // 1. Required Check
        if (question.required) {
            if (answer === undefined || answer === null || answer === '') {
                return 'THIS FIELD IS REQUIRED.';
            }
            if (Array.isArray(answer) && answer.length === 0) {
                return 'PLEASE SELECT AT LEAST ONE OPTION.';
            }
        }

        // 2. Custom Validations (Regex, Min, Max) - To be expanded later
        if (question.validations && question.validations.length > 0) {
            for (const rule of question.validations) {
                if (rule.type === 'minLength' && typeof answer === 'string' && answer.length < rule.value) {
                    return `MUST BE AT LEAST ${rule.value} CHARACTERS.`;
                }
                if (rule.type === 'maxLength' && typeof answer === 'string' && answer.length > rule.value) {
                    return `CANNOT EXCEED ${rule.value} CHARACTERS.`;
                }
            }
        }

        // Passed all checks
        return null;
    }
};
