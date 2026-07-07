import { formStore } from '../state/formStore.mjs';
import { OptionBuilder } from './OptionBuilder.mjs';
import { RuleBuilder } from './RuleBuilder.mjs';

export class QuestionBuilder {
    static render(sectionId, question) {
        return `
            <div class="border border-surface-200 bg-white rounded-xl p-6 relative group mb-4 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1 mr-4">
                        <div class="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded inline-block mb-2 select-all cursor-copy" title="Copy this ID for visibility rules">ID: ${question.id}</div>
                        <input 
                            type="text"
                            class="question-text-input w-full text-lg font-semibold text-slate-800 focus:outline-none border-b border-transparent focus:border-surface-300 pb-1 bg-transparent"
                            data-section-id="${sectionId}"
                            data-question-id="${question.id}"
                            value="${question.text || ''}"
                            placeholder="Question Text"
                        >
                    </div>
                    <div class="flex items-center gap-4">
                        <select 
                            class="question-type-select border border-surface-200 rounded-lg text-sm font-medium py-2 px-3 focus:outline-none bg-surface-50 cursor-pointer text-slate-700"
                            data-section-id="${sectionId}"
                            data-question-id="${question.id}"
                        >
                            <option value="text" ${question.type === 'text' ? 'selected' : ''}>Short Text</option>
                            <option value="textarea" ${question.type === 'textarea' ? 'selected' : ''}>Long Text</option>
                            <option value="radio" ${question.type === 'radio' ? 'selected' : ''}>Single Choice</option>
                            <option value="checkbox" ${question.type === 'checkbox' ? 'selected' : ''}>Multi Choice</option>
                            <option value="dropdown" ${question.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
                        </select>
                        <button class="remove-question-btn text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50" data-section-id="${sectionId}" data-question-id="${question.id}">
                            <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                
                ${OptionBuilder.render(sectionId, question)}
                ${RuleBuilder.render(sectionId, question)}

                <!-- Question Footer (Validation toggles) -->
                <div class="mt-4 pt-4 border-t border-surface-100 flex justify-end gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <span class="text-xs font-medium text-slate-500">Required</span>
                        <input type="checkbox" class="question-required-toggle sr-only" data-section-id="${sectionId}" data-question-id="${question.id}" ${question.required ? 'checked' : ''}>
                        <div class="w-10 h-5 bg-surface-200 rounded-full relative ${question.required ? 'bg-brand-700' : ''} transition-colors">
                            <div class="absolute w-4 h-4 bg-white rounded-full top-0.5 ${question.required ? 'right-0.5' : 'left-0.5'} transition-all shadow-sm"></div>
                        </div>
                    </label>
                </div>
            </div>
        `;
    }

    static attachListeners(container) {
        // Delegate listeners
        if (OptionBuilder && OptionBuilder.attachListeners) OptionBuilder.attachListeners(container);
        if (RuleBuilder && RuleBuilder.attachListeners) RuleBuilder.attachListeners(container);

        // Update Text
        container.querySelectorAll('.question-text-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, {
                    text: e.target.value
                });
            });
        });

        // Update Type (WITH FAIL-SAFE)
        container.querySelectorAll('.question-type-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const newType = e.target.value;
                const needsOptions = ['radio', 'checkbox', 'dropdown'].includes(newType);
                
                const updates = { type: newType };
                
                // Fail-safe: If we switch to a choice type, initialize the options array if it doesn't exist
                if (needsOptions) {
                    const sectionId = e.target.dataset.sectionId;
                    const questionId = e.target.dataset.questionId;
                    const section = formStore.getState().sections.find(s => s.id === sectionId);
                    const question = section.questions.find(q => q.id === questionId);
                    
                    if (!question.options || question.options.length === 0) {
                        updates.options = ['Option 1'];
                    }
                }
                
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, updates);
            });
        });

        // Delete Question
        container.querySelectorAll('.remove-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // closest('button') protects against clicking the inner SVG
                const button = e.target.closest('button');
                formStore.removeQuestion(button.dataset.sectionId, button.dataset.questionId);
            });
        });

        // Toggle Required
        container.querySelectorAll('.question-required-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                formStore.updateQuestion(e.target.dataset.sectionId, e.target.dataset.questionId, {
                    required: e.target.checked
                });
            });
        });
    }
}
