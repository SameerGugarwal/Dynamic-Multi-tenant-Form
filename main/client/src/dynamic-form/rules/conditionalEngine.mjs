export const ConditionalEngine = {
    /**
     * Evaluates a single rule against a specific answer.
     * @param {Object} rule - e.g., { targetQuestionId: 'q1', operator: 'equals', value: 'Yes' }
     * @param {Object} answers - A dictionary of { questionId: answerValue }
     * @returns {boolean}
     */
    evaluateRule(rule, answers) {
        const { targetQuestionId, operator, value } = rule;
        const answer = answers[targetQuestionId];

        // If the target question hasn't been answered yet, the rule inherently fails
        if (answer === undefined || answer === null || answer === '') return false;

        switch (operator) {
            case 'equals':
                return String(answer).trim().toLowerCase() === String(value).trim().toLowerCase();
            case 'not_equals':
                return String(answer).trim().toLowerCase() !== String(value).trim().toLowerCase();
            case 'contains':
                if (Array.isArray(answer)) return answer.includes(value);
                return String(answer).toLowerCase().includes(String(value).toLowerCase());
            case 'greater_than':
                return Number(answer) > Number(value);
            case 'less_than':
                return Number(answer) < Number(value);
            default:
                console.warn(`ConditionalEngine: Unknown operator '${operator}'`);
                return false;
        }
    },

    /**
     * Evaluates a group of rules using a logical operator (AND / OR)
     * @param {Object} ruleGroup - e.g., { logicalOperator: 'AND', rules: [...] }
     * @param {Object} answers 
     * @returns {boolean}
     */
    evaluateRuleGroup(ruleGroup, answers) {
        // If no rules exist, default to passing (visible)
        if (!ruleGroup || !ruleGroup.rules || ruleGroup.rules.length === 0) {
            return true;
        }

        const { logicalOperator = 'AND', rules } = ruleGroup;
        
        const results = rules.map(rule => this.evaluateRule(rule, answers));

        if (logicalOperator === 'AND') {
            return results.every(result => result === true);
        } else if (logicalOperator === 'OR') {
            return results.some(result => result === true);
        }

        return true;
    }
};
