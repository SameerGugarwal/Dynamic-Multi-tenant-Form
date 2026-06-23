import { formStore } from '../state/formStore.mjs';
import { FormRenderer } from '../renderer/FormRenderer.mjs';
import { SectionBuilder } from './SectionBuilder.mjs';

export class FormBuilder {
    constructor(container) {
        this.container = container;
        this.unsubscribe = null;
    }

    async mount() {
        // Subscribe to state changes to re-render
        this.unsubscribe = formStore.subscribe((state) => {
            this.render(state);
        });

        // Initial render
        this.render(formStore.getState());
    }

    unmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.container.innerHTML = '';
    }

    render(state) {
        this.container.innerHTML = `
            <div class="max-w-5xl mx-auto pb-32 animate-fade-in">
                <!-- Header Actions -->
                <div class="flex justify-between items-center mb-8 pb-4 border-b-2 border-surface-900">
                    <div>
                        <h2 class="text-3xl font-heading font-black text-surface-900 uppercase tracking-tighter">SCHEMA BUILDER</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-1">DYNAMIC FORM COMPOSITION ENGINE</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button id="preview-schema-btn" class="border-2 border-surface-900 bg-surface-50 text-surface-900 px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-surface-900 hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            PREVIEW ENGINE
                        </button>
                        <button id="save-schema-btn" class="bg-surface-900 text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            SAVE SCHEMA
                        </button>
                    </div>
                </div>

                <!-- Form Meta Data -->
                <div class="bg-white border-2 border-surface-900 p-8 mb-8 relative">
                    <div class="absolute -top-3 -left-3 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900">META</div>
                    
                    <input 
                        type="text" 
                        id="form-title" 
                        value="${state.title}"
                        placeholder="Form Title"
                        class="w-full text-4xl font-heading font-black uppercase tracking-tighter text-surface-900 mb-4 focus:outline-none border-b-2 border-transparent focus:border-surface-200 transition-colors bg-transparent placeholder-surface-300"
                    >
                    <textarea 
                        id="form-description"
                        placeholder="Enter form description or instructions..."
                        class="w-full text-surface-600 font-sans text-base focus:outline-none border-l-2 border-transparent focus:border-brand-500 pl-4 py-2 transition-all bg-transparent resize-none min-h-[80px]"
                    >${state.description}</textarea>
                </div>

                <!-- Sections Container -->
                <div id="sections-container" class="space-y-12">
                    ${state.sections.map((section, index) => SectionBuilder.render(section, index)).join('')}
                </div>

                <!-- Global Add Section Action -->
                <div class="mt-12 flex justify-center">
                    <button id="add-section-btn" class="border-2 border-dashed border-surface-400 text-surface-500 hover:text-surface-900 hover:border-surface-900 hover:bg-surface-50 w-full py-6 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                        ADD NEW SECTION
                    </button>
                </div>
            </div>
        `;

        this.initListeners(state);
    }

    initListeners(state) {
        // Modular Listeners
        SectionBuilder.attachListeners(this.container);

        // 1. Meta Data
        const titleInput = this.container.querySelector('#form-title');
        const descInput = this.container.querySelector('#form-description');
        
        const handleMetaChange = () => {
            formStore.updateMetadata(titleInput.value, descInput.value);
        };
        
        titleInput.addEventListener('blur', handleMetaChange);
        descInput.addEventListener('blur', handleMetaChange);

        // 2. Add Section
        const addSecBtn = this.container.querySelector('#add-section-btn');
        // Prevent duplicate listeners on re-render by replacing clone
        const newAddSecBtn = addSecBtn.cloneNode(true);
        addSecBtn.parentNode.replaceChild(newAddSecBtn, addSecBtn);
        newAddSecBtn.addEventListener('click', () => {
            formStore.addSection();
        });

        // 8. Save Payload
        this.container.querySelector('#save-schema-btn').addEventListener('click', async () => {
            const payload = formStore.getState();
            console.log("FINAL SCHEMA PAYLOAD: ", JSON.stringify(payload, null, 2));
            const { Toast } = await import('../../components/toast/Toast.mjs');
            Toast.success('Schema generated! Check console for JSON.');
        });

        // 9. Preview Engine
        this.container.querySelector('#preview-schema-btn').addEventListener('click', () => {
            const payload = formStore.getState();
            
            // Create a full-screen overlay for the FormRenderer
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-[100] bg-surface-50 overflow-y-auto animate-fade-in p-6';
            
            overlay.innerHTML = `
                <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white border-2 border-surface-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                        <span class="text-xs font-black uppercase tracking-widest text-brand-500">LIVE RENDER ENGINE</span>
                        <h2 class="text-xl font-heading font-black text-surface-900 uppercase">PREVIEW MODE</h2>
                    </div>
                    <button id="close-preview-btn" class="text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-red-600 hover:border-red-600 transition-colors">
                        CLOSE PREVIEW
                    </button>
                </div>
                <div id="renderer-mount-point"></div>
            `;
            
            document.body.appendChild(overlay);

            // Mount the FormRenderer
            const rendererContainer = overlay.querySelector('#renderer-mount-point');
            const renderer = new FormRenderer(rendererContainer, payload);
            renderer.mount();

            // Handle Close
            overlay.querySelector('#close-preview-btn').addEventListener('click', () => {
                document.body.removeChild(overlay);
            });
        });
    }
}
