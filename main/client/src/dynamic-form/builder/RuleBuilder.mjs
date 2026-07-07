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
            <div class="mt-6 bg-surface-50 border border-surface-200 rounded-lg p-4 relative shadow-sm">
                <label class="text-xs font-semibold text-brand-700 block mb-3">Conditional Visibility Rules</label>
                <div class="space-y-3 mb-4">
                    ${rules.map((rule, idx) => `
                        <div class="flex items-center gap-2 text-sm bg-white p-2 border border-surface-200 rounded-lg group/rule shadow-sm">
                            <span class="font-semibold text-brand-700 pl-2">Show if</span>
                            
                            <!-- Question ID it depends on -->
                            <input type="text" class="rule-target-input flex-1 bg-surface-50 px-2 py-1 rounded-md border border-surface-200 focus:border-brand-500 font-medium outline-none focus:ring-2 focus:ring-brand-500/20" 
                                value="${rule.dependsOn || ''}"
                                placeholder="e.g. q_12345"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}"
                            >
                            
                            <!-- Operator -->
                            <select class="rule-op-select bg-surface-50 px-2 py-1 rounded-md border border-surface-200 focus:border-brand-500 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-brand-500/20 text-slate-700"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}">
                                <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Equals</option>
                                <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Not Equals</option>
                            </select>

                            <!-- Value it must match -->
                            <input type="text" class="rule-value-input flex-1 bg-surface-50 px-2 py-1 rounded-md border border-surface-200 focus:border-brand-500 font-medium outline-none focus:ring-2 focus:ring-brand-500/20" 
                                value="${rule.value || ''}"
                                placeholder="Value"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}"
                            >

                            <button class="remove-rule-btn w-7 h-7 bg-surface-200 rounded-md text-surface-500 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-rule-index="${idx}">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                    
                    ${rules.length === 0 ? `<p class="text-sm font-medium text-slate-400 border border-dashed border-surface-200 rounded-lg p-2 text-center">No logic applied. Question is always visible.</p>` : ''}
                </div>
                
                <button class="add-rule-btn text-sm font-medium border border-surface-200 rounded-lg bg-white px-4 py-2 hover:bg-surface-100 transition-colors shadow-sm text-slate-700" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + Add Logic Rule
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
