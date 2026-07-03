import { formStore } from '../state/formStore.mjs';
import { QuestionBuilder } from './QuestionBuilder.mjs';

export class SectionBuilder {
    static render(section, index) {
        return `
            <div class="border-2 border-surface-900 bg-surface-50 relative group mb-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div class="absolute -top-3 -left-3 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">SEC ${index + 1}</div>
                
                <button class="delete-section-btn absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center border-2 border-surface-900 font-black hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10" data-section-id="${section.id}">
                    X
                </button>

                <!-- Section Header -->
                <div class="p-6 border-b-2 border-surface-900 bg-white">
                    <input 
                        type="text" 
                        class="section-title-input w-full text-2xl font-heading font-black uppercase tracking-widest text-surface-900 focus:outline-none bg-transparent"
                        data-id="${section.id}"
                        value="${section.title}"
                    >
                </div>

                <!-- Questions Container -->
                <div class="p-6 space-y-6">
                    ${section.questions.length === 0 
                        ? `<div class="text-center py-8 text-surface-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-surface-300">NO QUESTIONS DEFINED</div>`
                        : section.questions.map(q => QuestionBuilder.render(section.id, q)).join('')
                    }

                    <div class="pt-4 flex gap-4">
                        <button class="add-question-btn text-brand-600 hover:text-surface-900 font-black uppercase tracking-widest text-xs flex items-center gap-1 transition-colors" data-section-id="${section.id}">
                            + ADD QUESTION
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static attachListeners(container) {
        // Delegate question-level listeners to the QuestionBuilder
        if (QuestionBuilder && QuestionBuilder.attachListeners) {
            QuestionBuilder.attachListeners(container);
        }

        // Section Title change
        container.querySelectorAll('.section-title-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                const sectionId = e.target.dataset.id;
                // Use the updateSection method you already built in formStore!
                formStore.updateSection(sectionId, { title: e.target.value });
            });
        });

        // Add Question
        container.querySelectorAll('.add-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                formStore.addQuestion(e.target.dataset.sectionId, 'text');
            });
        });

        // Delete Section (Added this missing listener for the delete button)
        container.querySelectorAll('.delete-section-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this entire section?')) {
                    formStore.removeSection(e.target.dataset.sectionId);
                }
            });
        });
    }
}
