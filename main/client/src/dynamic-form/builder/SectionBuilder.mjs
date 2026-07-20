import { formStore } from '../state/formStore.mjs';
import { QuestionBuilder } from './QuestionBuilder.mjs';

export class SectionBuilder {
    static render(section, index) {
        return `
            <div class="border border-surface-200 bg-surface-50 relative group mb-12 shadow-sm rounded-xl">
                <div class="absolute -top-3 -left-3 bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Section ${index + 1}</div>
                
                <button class="delete-section-btn absolute -top-3 -right-3 bg-white text-red-500 w-8 h-8 flex items-center justify-center rounded-full border border-surface-200 font-semibold hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm z-10" data-section-id="${section.id}">
                    ✕
                </button>

                <!-- Section Header -->
                <div class="p-6 border-b border-surface-200 bg-white rounded-t-xl">
                    <input 
                        type="text" 
                        class="section-title-input w-full text-xltext-brand-900 focus:outline-none bg-transparent"
                        data-id="${section.id}"
                        value="${section.title}"
                    >
                </div>

                <!-- Questions Container -->
                <div class="p-6 space-y-6">
                    ${section.questions.length === 0 
                        ? `<div class="text-center py-8 text-slate-400 font-medium text-sm border-2 border-dashed border-surface-200 rounded-lg">No Questions Defined</div>`
                        : section.questions.map(q => QuestionBuilder.render(section.id, q)).join('')
                    }

                    <div class="pt-4 flex gap-4">
                        <button class="add-question-btn text-brand-700 hover:text-brand-800 font-medium text-sm flex items-center gap-1 transition-colors bg-white px-4 py-2 rounded-lg border border-surface-200 shadow-sm hover:bg-brand-50" data-section-id="${section.id}">
                            + Add Question
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
            input.onblur = (e) => {
                const sectionId = e.target.dataset.id;
                formStore.updateSection(sectionId, { title: e.target.value });
            };
        });

        // Add Question
        container.querySelectorAll('.add-question-btn').forEach(btn => {
            btn.onclick = (e) => {
                formStore.addQuestion(e.target.dataset.sectionId, 'text');
            };
        });

        // Delete Section
        container.querySelectorAll('.delete-section-btn').forEach(btn => {
            btn.onclick = (e) => {
                if (confirm('Delete this entire section?')) {
                    formStore.removeSection(e.target.dataset.sectionId);
                }
            };
        });
    }
}
