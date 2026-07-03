import { formStore } from '../state/formStore.mjs';

export class RuleBuilder {
    static getRules(question) {
        if (Array.isArray(question.visibilityRules)) {
            return question.visibilityRules;
        } else if (question.visibilityRules && Array.isArray(question.visibilityRules.rules)) {
            return question.visibilityRules.rules.map(r => ({
                dependsOn: r.targetQuestionId || r.dependsOn,
                operator: r.operator,
                value: r.value
            }));
        }
        return [];
    }

    static render(sectionId, question) {
        const rules = this.getRules(question);
        
        return `
            <div class="mt-6 bg-surface-50 border-2 border-surface-200 p-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <label class="text-[10px] font-black uppercase tracking-widest text-purple-600 block mb-3">CONDITIONAL VISIBILITY RULES</label>
                <div class="space-y-3 mb-4">
                    ${rules.map((rule, idx) => `
                        <div class="flex items-center gap-2 text-xs bg-white p-2 border-2 border-surface-900 group/rule">
                            <span class="font-black text-purple-600 uppercase tracking-widest pl-2">SHOW IF</span>
                            
                            <!-- Question ID it depends on -->
                            <input type="text" class="rule-target-input flex-1 bg-surface-50 px-2 py-1 border-2 border-transparent focus:border-purple-500 font-bold outline-none" 
                                value="${rule.dependsOn || ''}"
                                placeholder="e.g. q_12345"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}"
                            >
                            
                            <!-- Operator -->
                            <select class="rule-op-select bg-surface-50 px-2 py-1 border-2 border-transparent focus:border-purple-500 font-bold uppercase tracking-widest outline-none cursor-pointer"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}">
                                <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>EQUALS</option>
                                <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>NOT EQUALS</option>
                            </select>

                            <!-- Value it must match -->
                            <input type="text" class="rule-value-input flex-1 bg-surface-50 px-2 py-1 border-2 border-transparent focus:border-purple-500 font-bold outline-none" 
                                value="${rule.value || ''}"
                                placeholder="Value"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}"
                            >

                            <button class="remove-rule-btn w-7 h-7 bg-surface-200 text-surface-500 font-black text-xs hover:bg-red-500 hover:text-white transition-colors"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}">
                                X
                            </button>
                        </div>
                    `).join('')}
                    
                    ${rules.length === 0 ? `<p class="text-xs font-bold text-surface-400 uppercase tracking-widest border-2 border-dashed border-surface-300 p-2 text-center">No logic applied. Question is always visible.</p>` : ''}
                </div>
                
                <button class="add-rule-btn text-[10px] font-black uppercase tracking-widest border-2 border-surface-900 bg-white px-4 py-2 hover:bg-surface-900 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + ADD LOGIC RULE
                </button>
            </div>
        `;
    }

    static attachListeners(container) {
        // Add Rule
        container.querySelectorAll('.add-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                
                const rules = this.getRules(question);
                const newRule = { dependsOn: '', operator: 'equals', value: '' };
                
                formStore.updateQuestion(sId, qId, {
                    visibilityRules: [...rules, newRule]
                });
            });
        });

        // Remove Rule
        container.querySelectorAll('.remove-rule-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.ruleIndex);
                
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const rules = [...this.getRules(question)];
                rules.splice(idx, 1);
                
                formStore.updateQuestion(sId, qId, { visibilityRules: rules });
            });
        });

        // Update Rule Target (dependsOn)
        container.querySelectorAll('.rule-target-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.ruleIndex);
                
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const rules = [...this.getRules(question)];
                rules[idx].dependsOn = e.target.value;
                
                formStore.updateQuestion(sId, qId, { visibilityRules: rules });
            });
        });

        // Update Rule Operator
        container.querySelectorAll('.rule-op-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.ruleIndex);
                
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const rules = [...this.getRules(question)];
                rules[idx].operator = e.target.value;
                
                formStore.updateQuestion(sId, qId, { visibilityRules: rules });
            });
        });

        // Update Rule Value
        container.querySelectorAll('.rule-value-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.ruleIndex);
                
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const rules = [...this.getRules(question)];
                rules[idx].value = e.target.value;
                
                formStore.updateQuestion(sId, qId, { visibilityRules: rules });
            });
        });
    }
}
