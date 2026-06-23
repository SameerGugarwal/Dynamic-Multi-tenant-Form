/**
 * Evaluates a single logic condition against the provided user answers.
 * @param {Object} condition - The condition object from the question's logic.
 * @param {Object} userAnswersDict - A dictionary mapping questionId to the user's answer value.
 * @returns {boolean} - True if the condition is met, false otherwise.
 */
export const evaluateCondition = (condition, userAnswersDict) => {
    const { dependsOnQuestionId, operator, value } = condition;

    // Get the user's answer for the dependent question
    // Convert dependsOnQuestionId to string in case it's an ObjectId
    const userAnswer = userAnswersDict[dependsOnQuestionId.toString()];

    if (userAnswer === undefined || userAnswer === null) {
        // If the dependent question wasn't answered, evaluate accordingly
        if (operator === 'NOT_EQUALS' && value !== null) return true;
        return false;
    }

    // Convert values to strings for consistent comparison (unless they are booleans/numbers)
    // Here we assume basic string matching for forms, but handle numbers for greater/less than
    const strAnswer = String(userAnswer).trim().toLowerCase();
    const strValue = String(value).trim().toLowerCase();

    switch (operator) {
        case 'EQUALS':
            return strAnswer === strValue;
        case 'NOT_EQUALS':
            return strAnswer !== strValue;
        case 'CONTAINS':
            return strAnswer.includes(strValue);
        case 'GREATER_THAN':
            return Number(userAnswer) > Number(value);
        case 'LESS_THAN':
            return Number(userAnswer) < Number(value);
        default:
            return false; // Unknown operator
    }
};

/**
 * Evaluates whether a question should be visible based on its logic block and user answers.
 * @param {Object} questionLogic - The logic object from the question schema.
 * @param {Object} userAnswersDict - A dictionary mapping questionId to the user's answer value.
 * @returns {boolean} - True if visible, false if hidden.
 */
export const isQuestionVisible = (questionLogic, userAnswersDict) => {
    if (!questionLogic || !questionLogic.conditions || questionLogic.conditions.length === 0) {
        return true; // No logic means default visible
    }

    const { action, conditions, conditionType } = questionLogic;

    let conditionsMet = false;

    if (conditionType === 'OR') {
        conditionsMet = conditions.some(cond => evaluateCondition(cond, userAnswersDict));
    } else {
        // Default to AND
        conditionsMet = conditions.every(cond => evaluateCondition(cond, userAnswersDict));
    }

    // If action is SHOW, return whether conditions are met.
    // If action is HIDE, return the inverse (hide if met -> visible if NOT met)
    if (action === 'HIDE') {
        return !conditionsMet;
    }

    return conditionsMet;
};
