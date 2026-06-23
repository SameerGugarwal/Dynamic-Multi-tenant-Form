import { requiredValidator } from '../validators/requiredValidator.mjs';
import { regexValidator } from '../validators/regexValidator.mjs';
import { minValidator } from '../validators/minValidator.mjs';
import { maxValidator } from '../validators/maxValidator.mjs';

export const ValidationEngine = {
    /**
     * Validates a single question's answer against all its rules
     * @returns {string|null} - Returns an error message if invalid, or null if valid.
     */
    validateQuestion(question, answer) {
        // 1. Required Check
        const reqError = requiredValidator(answer, question.required);
        if (reqError) return reqError;

        // Skip other validations if empty and not required
        if (answer === undefined || answer === null || String(answer).trim() === '') {
            return null;
        }

        // 2. Custom Validations (if the question schema defines an array of custom validations)
        if (question.validations && Array.isArray(question.validations)) {
            for (const rule of question.validations) {
                let error = null;
                switch (rule.type) {
                    case 'regex':
                        error = regexValidator(answer, rule.pattern, rule.message);
                        break;
                    case 'min':
                        error = minValidator(answer, rule.value);
                        break;
                    case 'max':
                        error = maxValidator(answer, rule.value);
                        break;
                }
                if (error) return error; // Return first error encountered
            }
        }

        return null; // Valid
    }
};
