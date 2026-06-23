import { formStore } from '../state/formStore.mjs';
import { QuestionBuilder } from './QuestionBuilder.mjs';

export class SectionBuilder {
    static render(section, index) {
        return `
            <div class="border-2 border-surface-900 bg-surface-50 relative group mb-12">
                <div class="absolute -top-3 -left-3 bg-surface-900 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">SEC ${index + 1}</div>
                
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

                    <div class="pt-4">
                        <button class="add-question-btn text-brand-600 hover:text-surface-900 font-black uppercase tracking-widest text-xs flex items-center gap-1" data-section-id="${section.id}">
                            + ADD QUESTION
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static attachListeners(container) {
        QuestionBuilder.attachListeners(container);

        container.querySelectorAll('.section-title-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                const sectionId = e.target.dataset.id;
                const sections = formStore.getState().sections.map(s => {
                    if (s.id === sectionId) return { ...s, title: e.target.value };
                    return s;
                });
                // We update state via store (need an updateSection method or direct mutation with notify)
                // Assuming formStore has a generic state setter or we implement updateSection
                formStore.state.sections = sections;
                formStore.notify();
            });
        });

        container.querySelectorAll('.add-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                formStore.addQuestion(e.target.dataset.sectionId);
            });
        });
    }
}
