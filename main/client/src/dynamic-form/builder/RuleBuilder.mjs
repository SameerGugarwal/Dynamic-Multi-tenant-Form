import { formStore } from '../state/formStore.mjs';

export class RuleBuilder {
    static render(sectionId, question) {
        // Minimal logic representation for rules configuration in the builder
        const rules = question.visibilityRules?.rules || [];
        
        return `
            <div class="pl-4 border-l-4 border-purple-500 mt-4 space-y-2 pb-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-2">VISIBILITY RULES</p>
                <div class="space-y-2">
                    ${rules.map((rule, idx) => `
                        <div class="flex items-center gap-2 text-xs bg-surface-50 p-2 border border-surface-200">
                            <span class="font-bold">IF</span>
                            <span class="bg-white px-2 py-1 border border-surface-200">${rule.targetQuestionId}</span>
                            <span class="text-surface-500 uppercase">${rule.operator}</span>
                            <span class="bg-white px-2 py-1 border border-surface-200">${rule.value}</span>
                            <button class="remove-rule-btn ml-auto text-surface-400 hover:text-red-600"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}">
                                &times;
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-rule-btn text-[10px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-700 mt-2" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + ADD LOGIC RULE
                </button>
            </div>
        `;
    }

    static attachListeners(container) {
        container.querySelectorAll('.add-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                
                const existingRules = question.visibilityRules?.rules || [];
                const newRule = { targetQuestionId: 'q_previous', operator: 'equals', value: 'Yes' };
                
                formStore.updateQuestion(sId, qId, {
                    visibilityRules: {
                        logicalOperator: 'AND',
                        rules: [...existingRules, newRule]
                    }
                });
            });
        });

        container.querySelectorAll('.remove-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.ruleIndex);
                
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const rules = [...question.visibilityRules.rules];
                rules.splice(idx, 1);
                
                formStore.updateQuestion(sId, qId, {
                    visibilityRules: {
                        logicalOperator: question.visibilityRules.logicalOperator,
                        rules
                    }
                });
            });
        });
    }
}
