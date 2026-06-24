import { VisibilityEngine } from '../rules/visibilityEngine.mjs';
import { ValidationEngine } from '../rules/validationEngine.mjs';

export class FormRenderer {
    /**
     * @param {HTMLElement} container 
     * @param {Object} schema - The full JSON schema of the form
     */
    constructor(container, schema) {
        this.container = container;
        this.schema = schema;
        this.answers = {}; // Tracks live user input
        this.visibilityMap = {}; // Tracks current visibility state
    }

    mount() {
        // Initial compute
        this.visibilityMap = VisibilityEngine.computeVisibility(this.schema, this.answers);
        
        // Render physical DOM
        this.container.innerHTML = this.renderBase();
        
        // Apply initial visibility
        this.applyVisibility();

        // Attach listeners
        this.initListeners();
    }

    renderBase() {
        return `
            <div class="max-w-4xl mx-auto p-8 bg-white border-2 border-surface-900 mb-20 animate-fade-in shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <!-- Header -->
                <div class="mb-12 border-b-4 border-surface-900 pb-6">
                    <h1 class="text-5xl font-heading font-black text-surface-900 uppercase tracking-tighter">${this.schema.title}</h1>
                    ${this.schema.description ? `<p class="mt-4 text-brand-600 font-sans text-lg">${this.schema.description}</p>` : ''}
                </div>

                <!-- Sections -->
                <div id="renderer-sections" class="space-y-12">
                    ${this.schema.sections.map((section, index) => this.renderSection(section, index)).join('')}
                </div>

                <!-- Footer Actions -->
                <div class="mt-16 pt-8 border-t-2 border-surface-900 flex justify-end">
                    <button id="submit-form-btn" class="bg-surface-900 text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        SUBMIT PAYLOAD
                    </button>
                </div>
            </div>
        `;
    }

    renderSection(section, index) {
        return `
            <div class="form-section" data-section-id="${section.id}">
                <div class="mb-6 flex items-center gap-4">
                    <div class="w-10 h-10 bg-brand-500 flex items-center justify-center text-white font-black font-heading border-2 border-surface-900">${index + 1}</div>
                    <h2 class="text-2xl font-heading font-black text-surface-900 uppercase tracking-widest">${section.title}</h2>
                </div>
                
                <div class="pl-14 space-y-8">
                    ${section.questions.map(q => this.renderQuestion(q)).join('')}
                </div>
            </div>
        `;
    }

    renderQuestion(question) {
        const isRequiredHtml = question.required ? `<span class="text-red-500 ml-1">*</span>` : '';
        
        return `
            <div class="form-question transition-all duration-300 overflow-hidden" data-question-id="${question.id}">
                <label class="block text-sm font-bold text-surface-900 uppercase tracking-widest mb-3">
                    ${question.text} ${isRequiredHtml}
                </label>
                ${this.renderInputType(question)}
                <div class="error-msg text-red-600 text-xs font-bold uppercase tracking-widest mt-2 hidden"></div>
            </div>
        `;
    }

    renderInputType(question) {
        const id = question.id;
        switch (question.type) {
            case 'text':
                return `<input type="text" class="question-input w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors" data-id="${id}" />`;
            case 'textarea':
                return `<textarea class="question-input w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors min-h-[100px] resize-y" data-id="${id}"></textarea>`;
            case 'dropdown':
                const dropdownOpts = question.options && question.options.length > 0 ? question.options : ['Option A', 'Option B'];
                const optsHtml = dropdownOpts.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                return `
                    <select class="question-input w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors appearance-none cursor-pointer" data-id="${id}">
                        <option value="" disabled selected>SELECT AN OPTION...</option>
                        ${optsHtml}
                    </select>
                `;
            case 'radio':
                const radioOpts = question.options && question.options.length > 0 ? question.options : ['Yes', 'No'];
                return `
                    <div class="space-y-2">
                        ${radioOpts.map(opt => `
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative w-5 h-5 border-2 border-surface-900 bg-surface-50 flex items-center justify-center group-hover:border-brand-500">
                                    <input type="radio" name="${id}" value="${opt}" class="question-input sr-only" data-id="${id}" />
                                    <div class="w-2.5 h-2.5 bg-brand-500 hidden radio-check"></div>
                                </div>
                                <span class="text-sm font-bold text-surface-900">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            case 'checkbox':
                const checkboxOpts = question.options && question.options.length > 0 ? question.options : ['Option 1', 'Option 2'];
                return `
                    <div class="space-y-2">
                        ${checkboxOpts.map(opt => `
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative w-5 h-5 border-2 border-surface-900 bg-surface-50 flex items-center justify-center group-hover:border-brand-500">
                                    <input type="checkbox" name="${id}[]" value="${opt}" class="question-input sr-only" data-id="${id}" />
                                    <div class="w-3 h-3 bg-brand-500 hidden checkbox-check"></div>
                                </div>
                                <span class="text-sm font-bold text-surface-900">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
            default:
                return `<input type="text" class="question-input w-full px-4 py-3 border-2 border-surface-900" data-id="${id}" />`;
        }
    }

    initListeners() {
        // Handle input changes
        const handleInteraction = (e) => {
            const target = e.target;
            if (target.classList.contains('question-input')) {
                const qId = target.dataset.id;
                this.answers[qId] = target.value;
                
                // If radio, manually handle styling
                if (target.type === 'radio') {
                    // Reset all
                    const radios = this.container.querySelectorAll(`input[name="${qId}"]`);
                    radios.forEach(r => {
                        r.nextElementSibling.classList.add('hidden');
                    });
                    // Show checked
                    if (target.checked) {
                        target.nextElementSibling.classList.remove('hidden');
                    }
                }
                
                // If checkbox, manually handle styling
                if (target.type === 'checkbox') {
                    if (target.checked) {
                        target.nextElementSibling.classList.remove('hidden');
                    } else {
                        target.nextElementSibling.classList.add('hidden');
                    }
                    
                    // Harvest all checked values for this group
                    const checkboxes = this.container.querySelectorAll(`input[name="${qId}[]"]:checked`);
                    this.answers[qId] = Array.from(checkboxes).map(cb => cb.value);
                }

                // Re-evaluate visibility engine
                this.evaluateAndRenderVisibility();
            }
        };

        this.container.addEventListener('input', handleInteraction);
        this.container.addEventListener('change', handleInteraction);

        // Submit Payload
        this.container.querySelector('#submit-form-btn').addEventListener('click', async () => {
            if (this.validateForm()) {
                console.log("FINAL SUBMISSION PAYLOAD: ", this.answers);
                const { Toast } = await import('../../components/toast/Toast.mjs');
                Toast.success('Form Submitted Successfully!');
            }
        });
    }

    evaluateAndRenderVisibility() {
        // Re-compute based on new answers
        this.visibilityMap = VisibilityEngine.computeVisibility(this.schema, this.answers);
        this.applyVisibility();
    }

    applyVisibility() {
        // Toggle DOM nodes
        const questions = this.container.querySelectorAll('.form-question');
        questions.forEach(qNode => {
            const id = qNode.dataset.questionId;
            const isVisible = this.visibilityMap.questions[id];
            
            if (isVisible) {
                qNode.classList.remove('hidden');
            } else {
                qNode.classList.add('hidden');
                // Optional: clear answer if hidden? 
                // delete this.answers[id]; 
                // e.target.value = '';
                // Doing this requires re-evaluating the engine again, keeping it simple for now.
            }
        });
    }

    validateForm() {
        let isValid = true;
        
        this.schema.sections.forEach(sec => {
            sec.questions.forEach(q => {
                // Only validate if it's visible
                if (this.visibilityMap.questions[q.id]) {
                    const ans = this.answers[q.id];
                    const qNode = this.container.querySelector(`.form-question[data-question-id="${q.id}"]`);
                    const errorMsg = qNode.querySelector('.error-msg');
                    
                    const errorText = ValidationEngine.validateQuestion(q, ans);
                    
                    if (errorText) {
                        isValid = false;
                        errorMsg.textContent = errorText;
                        errorMsg.classList.remove('hidden');
                    } else {
                        errorMsg.classList.add('hidden');
                    }
                }
            });
        });

        return isValid;
    }
}
