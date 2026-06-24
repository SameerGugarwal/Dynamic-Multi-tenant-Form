import { ConditionalEngine } from './conditionalEngine.mjs';

export const VisibilityEngine = {
    /**
     * Computes the visibility state for all sections and questions in the schema based on current answers.
     * @param {Object} schema - The full JSON form schema
     * @param {Object} answers - Map of { questionId: currentAnswer }
     * @returns {Object} visibilityMap - e.g. { questions: { q1: true, q2: false } }
     */
    computeVisibility(schema, answers) {
        const visibilityMap = {
            sections: {},
            questions: {}
        };

        if (!schema || !schema.sections) return visibilityMap;

        schema.sections.forEach(section => {
            // For now, sections are always visible. 
            // Future feature: add section-level visibility rules.
            visibilityMap.sections[section.id] = true;

            let prevQuestionId = null;

            section.questions.forEach(question => {
                // Check if this specific question has a visibility rule group attached
                if (question.visibilityRules && question.visibilityRules.rules && question.visibilityRules.rules.length > 0) {
                    
                    // Resolve 'q_previous' to the actual previous question ID
                    const resolvedRules = question.visibilityRules.rules.map(rule => {
                        if (rule.targetQuestionId === 'q_previous') {
                            return { ...rule, targetQuestionId: prevQuestionId };
                        }
                        return rule;
                    });
                    
                    const resolvedRuleGroup = { ...question.visibilityRules, rules: resolvedRules };
                    
                    const isVisible = ConditionalEngine.evaluateRuleGroup(resolvedRuleGroup, answers);
                    visibilityMap.questions[question.id] = isVisible;
                } else {
                    // No rules defined? Default to visible.
                    visibilityMap.questions[question.id] = true;
                }
                
                // Update prevQuestionId for the next iteration
                prevQuestionId = question.id;
            });
        });

        return visibilityMap;
    }
};
