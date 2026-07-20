import { formStore } from '../state/formStore.mjs';
import { FormRenderer } from '../renderer/FormRenderer.mjs';
import { SectionBuilder } from './SectionBuilder.mjs';
import morphdom from 'morphdom';

export class FormBuilder {
    constructor(container) {
        this.container = container;
        this.unsubscribe = null;
    }

    async mount() {
        this.render(formStore.getState());

        this.unsubscribe = formStore.subscribe((state) => {
            const temp = document.createElement('div');
            temp.innerHTML = this.getHtmlString(state);
            
            morphdom(this.container.firstElementChild, temp.firstElementChild, {
                onBeforeElUpdated: function(fromEl, toEl) {
                    // Prevent morphing the actively focused element so we don't lose the cursor mid-typing
                    if (document.activeElement === fromEl) {
                        return false; 
                    }
                    return true;
                }
            });
            this.initListeners(state);
        });
    }

    unmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.container.innerHTML = '';
    }

    render(state) {
        if (!this.container.firstElementChild) {
            this.container.innerHTML = this.getHtmlString(state);
        }
        this.initListeners(state);
    }

    getHtmlString(state) {
        return `
            <div class="max-w-5xl mx-auto pb-32 animate-fade-in ">
                <!-- Header Actions -->
                <div class="flex justify-between items-center mb-8 pb-4 border-b border-surface-200">
                    <div>
                        <h2 class="text-3xltext-brand-900">Schema Builder</h2>
                        <p class="text-slate-500 font-medium text-sm mt-1">Dynamic Form Composition Engine</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button id="preview-schema-btn" class="border border-surface-200 bg-surface-50 text-slate-700 px-6 py-2.5 font-medium text-sm rounded-lg hover:bg-surface-100 transition-colors shadow-sm">
                            Preview Engine
                        </button>
                        <button id="save-schema-btn" class="${formStore.isDirty ? '' : 'hidden'} bg-brand-700 text-white px-8 py-2.5 font-medium text-sm rounded-lg hover:bg-brand-800 transition-colors shadow-sm">
                            Save Schema
                        </button>
                    </div>
                </div>

                <!-- Form Meta Data -->
                <div class="bg-white border border-surface-200 rounded-xl p-8 mb-8 relative shadow-sm">
                    <div class="absolute -top-3 -left-3 bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Meta</div>
                    
                    <input 
                        type="text" 
                        id="form-title" 
                        value="${state.title}"
                        placeholder="Form Title"
                        class="w-full text-3xltext-brand-900 mb-4 focus:outline-none border-b border-transparent focus:border-surface-300 transition-colors bg-transparent placeholder-slate-400"
                    >
                    <textarea 
                        id="form-description"
                        placeholder="Enter form description or instructions..."
                        class="w-full text-slate-600 font-sans text-base focus:outline-none border border-transparent focus:border-surface-300 rounded-lg p-3 transition-all bg-surface-50 resize-none min-h-24"
                    >${state.description}</textarea>
                </div>

                <!-- Sections Container -->
                <div id="sections-container" class="space-y-12">
                    ${state.sections.map((section, index) => SectionBuilder.render(section, index)).join('')}
                </div>

                <!-- Global Add Section Action -->
                <div class="mt-12 flex justify-center">
                    <button id="add-section-btn" class="border-2 border-dashed border-surface-300 rounded-xl text-slate-500 hover:text-brand-700 hover:border-brand-500 hover:bg-brand-50 w-full py-6 font-medium text-sm transition-all flex items-center justify-center gap-2">
                        Add New Section
                    </button>
                </div>
            </div>
        `;
    }

    initListeners(state) {
        // Modular Listeners (Delegates question logic to SectionBuilder)
        if (SectionBuilder && SectionBuilder.attachListeners) {
            SectionBuilder.attachListeners(this.container);
        }

        // 1. Meta Data
        const titleInput = this.container.querySelector('#form-title');
        const descInput = this.container.querySelector('#form-description');
        
        const handleMetaChange = () => {
            formStore.updateMetadata(titleInput.value, descInput.value);
        };
        
        // Use onchange to prevent double-attaching listeners
        titleInput.onchange = handleMetaChange;
        descInput.onchange = handleMetaChange;

        // 2. Add Section
        const addSecBtn = this.container.querySelector('#add-section-btn');
        addSecBtn.onclick = () => {
            formStore.addSection();
        };

        // 3. Save Payload
        this.container.querySelector('#save-schema-btn').onclick = async () => {
            const payload = formStore.getState();
            this.container.dispatchEvent(new CustomEvent('schema-saved', { detail: payload }));
        };

        // 4. Preview Engine
        this.container.querySelector('#preview-schema-btn').onclick = () => {
            const payload = formStore.getState();
            
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-[100] bg-surface-50 overflow-y-auto animate-fade-in p-6';
            
            overlay.innerHTML = `
                <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                    <div>
                        <span class="text-xs font-semibold text-brand-700">Live Render Engine</span>
                        <h2 class="text-xltext-brand-900">Preview Mode</h2>
                    </div>
                    <button id="close-preview-btn" class="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
                        Close Preview
                    </button>
                </div>
                <div id="renderer-mount-point" class="max-w-4xl mx-auto"></div>
            `;
            
            document.body.appendChild(overlay);

            const rendererContainer = overlay.querySelector('#renderer-mount-point');
            const renderer = new FormRenderer(rendererContainer, payload);
            renderer.mount();

            overlay.querySelector('#close-preview-btn').addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        };
    }
}
