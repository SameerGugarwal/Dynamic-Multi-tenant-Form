import { formStore } from '../state/formStore.mjs';

export class OptionBuilder {
    static render(sectionId, question) {
        if (!['radio', 'checkbox', 'dropdown'].includes(question.type)) return '';

        const options = question.options || [];
        
        return `
            <div class="mt-6 bg-surface-50 border-2 border-surface-200 p-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <label class="text-[10px] font-black uppercase tracking-widest text-brand-600 block mb-3">CHOICE OPTIONS CONFIGURATION</label>
                <div class="space-y-3 mb-4" id="options-list-${question.id}">
                    ${options.map((opt, idx) => `
                        <div class="flex items-center gap-2 group/opt">
                            <div class="w-4 h-4 border-2 border-surface-900 bg-white ${question.type === 'radio' ? 'rounded-full' : ''}"></div>
                            <input type="text" 
                                class="option-input flex-1 border-2 border-transparent focus:border-surface-900 px-2 py-1 text-sm font-bold focus:outline-none bg-white transition-colors shadow-sm focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                value="${opt}"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}"
                            >
                            <button class="remove-option-btn w-7 h-7 bg-surface-200 text-surface-500 font-black text-xs hover:bg-red-500 hover:text-white transition-colors"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}">
                                X
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option-btn text-[10px] font-black uppercase tracking-widest border-2 border-surface-900 bg-white px-4 py-2 hover:bg-surface-900 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + ADD NEW OPTION
                </button>
            </div>
        `;
    }

    static attachListeners(container) {
        container.querySelectorAll('.add-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = question.options || [];
                formStore.updateQuestion(sId, qId, { options: [...opts, `Option ${opts.length + 1}`] });
            });
        });

        container.querySelectorAll('.remove-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.optionIndex);
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = [...question.options];
                opts.splice(idx, 1);
                formStore.updateQuestion(sId, qId, { options: opts });
            });
        });

        container.querySelectorAll('.option-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const sId = e.target.dataset.sectionId;
                const qId = e.target.dataset.questionId;
                const idx = parseInt(e.target.dataset.optionIndex);
                const question = formStore.getState().sections.find(s => s.id === sId).questions.find(q => q.id === qId);
                const opts = [...question.options];
                opts[idx] = e.target.value;
                formStore.updateQuestion(sId, qId, { options: opts });
            });
        });
    }
}
