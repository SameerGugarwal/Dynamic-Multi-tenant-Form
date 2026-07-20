import { formStore } from '../state/formStore.mjs';

export class OptionBuilder {
    static render(sectionId, question) {
        if (!['radio', 'checkbox', 'dropdown'].includes(question.type)) return '';

        const options = question.options || [];
        
        return `
            <div class="mt-6 bg-surface-50 border border-surface-200 rounded-lg p-4 relative shadow-sm">
                <label class="text-xs font-semibold text-brand-700 block mb-3">Choice Options Configuration</label>
                <div class="space-y-3 mb-4" id="options-list-${question.id}">
                    ${options.map((opt, idx) => `
                        <div class="flex items-center gap-2 group/opt">
                            <div class="w-4 h-4 border border-surface-300 bg-white ${question.type === 'radio' ? 'rounded-full' : 'rounded-sm'}"></div>
                            <input type="text" 
                                class="option-input flex-1 border border-surface-200 rounded-md focus:border-brand-500 px-2 py-1 text-sm font-medium focus:outline-none bg-white transition-colors shadow-sm focus:ring-2 focus:ring-brand-500/20"
                                value="${opt}"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}"
                            >
                            <button class="remove-option-btn w-7 h-7 bg-surface-200 rounded-md text-surface-500 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option-btn text-sm font-medium border border-surface-200 rounded-lg bg-white px-4 py-2 hover:bg-surface-100 transition-colors shadow-sm text-slate-700" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + Add New Option
                </button>
            </div>
        `;
    }

    static attachListeners(container) {
        container.querySelectorAll('.add-option-btn').forEach(btn => {
            btn.onclick = (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = question.options || [];
                formStore.updateQuestion(sId, qId, { options: [...opts, `Option ${opts.length + 1}`] });
            };
        });

        container.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.onclick = (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.optionIndex);
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = [...question.options];
                opts.splice(idx, 1);
                formStore.updateQuestion(sId, qId, { options: opts });
            };
        });

        container.querySelectorAll('.option-input').forEach(input => {
            input.onchange = (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.optionIndex);
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = [...question.options];
                opts[idx] = e.target.value;
                formStore.updateQuestion(sId, qId, { options: opts });
            };
        });
    }
}
