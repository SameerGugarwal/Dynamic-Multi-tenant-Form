import { formStore } from '../state/formStore.mjs';
import { OptionBuilder } from './OptionBuilder.mjs';
import { RuleBuilder } from './RuleBuilder.mjs';

export class QuestionBuilder {
    static render(sectionId, question) {
        return `
            <div class="border-2 border-surface-900 bg-white p-6 relative group mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1 mr-4">
                        <input 
                            type="text"
                            class="question-text-input w-full text-lg font-bold text-surface-900 focus:outline-none border-b-2 border-surface-200 focus:border-brand-500 pb-1"
                            data-section-id="${sectionId}"
                            data-question-id="${question.id}"
                            value="${question.text}"
                            placeholder="Question Text"
                        >
                    </div>
                    <div class="flex items-center gap-4">
                        <select 
                            class="question-type-select border-2 border-surface-900 text-xs font-bold uppercase tracking-widest py-2 px-3 focus:outline-none bg-surface-50"
                            data-section-id="${sectionId}"
                            data-question-id="${question.id}"
                        >
                            <option value="text" ${question.type === 'text' ? 'selected' : ''}>SHORT TEXT</option>
                            <option value="textarea" ${question.type === 'textarea' ? 'selected' : ''}>LONG TEXT</option>
                            <option value="radio" ${question.type === 'radio' ? 'selected' : ''}>SINGLE CHOICE</option>
                            <option value="checkbox" ${question.type === 'checkbox' ? 'selected' : ''}>MULTI CHOICE</option>
                            <option value="dropdown" ${question.type === 'dropdown' ? 'selected' : ''}>DROPDOWN</option>
                        </select>
                        <button class="remove-question-btn text-surface-400 hover:text-red-600 transition-colors" data-section-id="${sectionId}" data-question-id="${question.id}">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                
                ${OptionBuilder.render(sectionId, question)}
                ${RuleBuilder.render(sectionId, question)}

                <!-- Question Footer (Validation toggles) -->
                <div class="mt-4 pt-4 border-t border-surface-200 flex justify-end gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <span class="text-[10px] font-black uppercase tracking-widest text-surface-500">REQUIRED</span>
                        <input type="checkbox" class="question-required-toggle sr-only" data-section-id="${sectionId}" data-question-id="${question.id}" ${question.required ? 'checked' : ''}>
                        <div class="w-8 h-4 bg-surface-200 border-2 border-surface-900 relative ${question.required ? 'bg-surface-900' : ''} transition-colors">
                            <div class="absolute w-2 h-2 bg-white top-0.5 ${question.required ? 'right-0.5' : 'left-0.5'}"></div>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    static attachListeners(container) {
        OptionBuilder.attachListeners(container);
        RuleBuilder.attachListeners(container);

        container.querySelectorAll('.question-text-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, {
                    text: e.target.value
                });
            });
        });

        container.querySelectorAll('.question-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, {
                    type: e.target.value
                });
            });
        });

        container.querySelectorAll('.remove-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                formStore.removeQuestion(button.dataset.sectionId, button.dataset.questionId);
            });
        });

        container.querySelectorAll('.question-required-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, {
                    required: e.target.checked
                });
            });
        });
    }
}
