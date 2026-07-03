export const VisibilityEngine = {
    /**
     * Computes which questions should be visible based on current answers
     * @param {Object} schema - The full form schema
     * @param {Object} answers - Map of { questionId: answerValue }
     * @returns {Object} - { questions: { q1: true, q2: false } }
     */
    computeVisibility(schema, answers) {
        const visibilityMap = {
            questions: {}
        };

        if (!schema || !schema.sections) return visibilityMap;

        schema.sections.forEach(section => {
            section.questions.forEach(q => {
                let isVisible = true;

                // Normalize rules
                let rules = [];
                if (Array.isArray(q.visibilityRules)) {
                    rules = q.visibilityRules;
                } else if (q.visibilityRules && Array.isArray(q.visibilityRules.rules)) {
                    rules = q.visibilityRules.rules.map(r => ({
                        dependsOn: r.targetQuestionId || r.dependsOn,
                        operator: r.operator,
                        value: r.value
                    }));
                }

                // If question has rules, evaluate them
                if (rules.length > 0) {
                    isVisible = rules.every(rule => {
                        const targetAnswer = answers[rule.dependsOn];
                        
                        // Handle undefined/empty answers gracefully
                        if (targetAnswer === undefined) return false;

                        if (rule.operator === 'equals') {
                            if (Array.isArray(targetAnswer)) {
                                return targetAnswer.includes(rule.value);
                            }
                            return targetAnswer === rule.value;
                        }
                        
                        if (rule.operator === 'not_equals') {
                            if (Array.isArray(targetAnswer)) {
                                return !targetAnswer.includes(rule.value);
                            }
                            return targetAnswer !== rule.value;
                        }

                        return true; // Pass if operator is unknown for now
                    });
                }

                visibilityMap.questions[q.id] = isVisible;
            });
        });

        return visibilityMap;
    }
};
