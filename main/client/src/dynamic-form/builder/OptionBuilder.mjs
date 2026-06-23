import { formStore } from '../state/formStore.mjs';

export class OptionBuilder {
    static render(sectionId, question) {
        if (!['radio', 'checkbox', 'dropdown'].includes(question.type)) return '';

        const options = question.options || [];
        
        return `
            <div class="pl-4 border-l-4 border-brand-500 mt-4 space-y-2 pb-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-2">OPTIONS CONFIGURATION</p>
                <div class="space-y-2" id="options-list-${question.id}">
                    ${options.map((opt, idx) => `
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 border-2 border-surface-900 ${question.type === 'radio' ? 'rounded-full' : ''}"></div>
                            <input type="text" 
                                class="option-input flex-1 border-b-2 border-surface-200 focus:border-brand-500 focus:outline-none text-sm py-1 bg-transparent"
                                value="${opt}"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}"
                            >
                            <button class="remove-option-btn text-surface-400 hover:text-red-600 transition-colors"
                                data-section-id="${sectionId}"
                                data-question-id="${question.id}"
                                data-option-index="${idx}">
                                &times;
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option-btn text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-700 mt-2" 
                    data-section-id="${sectionId}" 
                    data-question-id="${question.id}">
                    + ADD OPTION
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
            input.addEventListener('blur', (e) => {
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
