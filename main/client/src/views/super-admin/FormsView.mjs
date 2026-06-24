import { Table } from '../../components/table/Table.mjs';
import http from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { FormBuilder } from '../../dynamic-form/builder/FormBuilder.mjs';
import { formStore } from '../../dynamic-form/state/formStore.mjs';
import { FormRenderer } from '../../dynamic-form/renderer/FormRenderer.mjs';

export default class FormsView {
    async mount(container) {
        this.container = container;
        this.render();
        await this.loadMasterForms();
        
        // Form creation
        this.container.querySelector('#add-form-btn').addEventListener('click', async () => {
            const title = prompt('Enter a title for the new Master Form:');
            if (!title) return;
            try {
                await http.post('/forms', { title, visibility: 'PRIVATE' });
                Toast.success('Master Form Created!');
                this.loadMasterForms();
            } catch (err) {
                Toast.error('Failed to create form');
            }
        });

        // Close preview modal
        this.container.querySelector('#close-preview-modal').addEventListener('click', () => {
            this.container.querySelector('#preview-modal-container').classList.add('hidden');
        });

        // Close builder container
        this.container.querySelector('#close-builder-btn').addEventListener('click', () => {
            this.container.querySelector('#builder-container').classList.add('hidden');
            this.loadMasterForms(); // Reload to reflect any potential builder changes
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">GLOBAL FORMS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">MASTER TEMPLATE MANAGEMENT</p>
                    </div>
                    <button id="add-form-btn" class="bg-surface-900 text-white px-4 py-2 font-bold">+ CREATE MASTER FORM</button>
                </div>
                <div id="table-container">LOADING...</div>
                
                <div id="builder-container" class="mt-12 hidden border-t-4 border-surface-900 pt-8 relative">
                    <button id="close-builder-btn" class="absolute top-8 right-0 text-surface-500 hover:text-surface-900 font-bold uppercase tracking-widest text-xs">CLOSE BUILDER X</button>
                    <h3 class="text-2xl font-black uppercase mb-4">FORM BUILDER</h3>
                    <div id="form-builder-mount"></div>
                </div>

                <!-- PREVIEW MODAL OVERLAY -->
                <div id="preview-modal-container" class="hidden fixed inset-0 bg-surface-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div class="bg-surface-50 border-4 border-surface-900 p-8 max-w-3xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] flex flex-col">
                        <button id="close-preview-modal" class="absolute top-4 right-4 text-surface-500 hover:text-surface-900 font-bold uppercase tracking-widest text-xs">CLOSE X</button>
                        <h3 class="text-2xl font-black uppercase mb-4 border-b-2 border-surface-900 pb-2">FORM PREVIEW</h3>
                        <div class="overflow-y-auto flex-1 p-4 bg-white border-2 border-surface-200" id="form-preview-mount">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadMasterForms() {
        const headers = ['MASTER FORM ID', 'TITLE', 'VISIBILITY', 'ACTIONS'];
        try {
            const res = await http.get('/forms/master');
            const rawData = res.data || res || [];
            const data = Array.isArray(rawData) ? rawData : (rawData.data || []);
            const rows = data.map(f => {
                const isPublic = f.visibility === 'PUBLIC';
                return {
                    id: f._id,
                    title: `<button class="preview-btn font-bold uppercase tracking-widest text-brand-500 hover:text-brand-700 underline transition-colors" data-id="${f._id}" data-title="${f.title}">${f.title}</button>`,
                    visibility: `
                        <select class="visibility-toggle text-xs font-bold p-1 border-2 border-surface-900 ${isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}" data-id="${f._id}">
                            <option value="PRIVATE" ${!isPublic ? 'selected' : ''}>PRIVATE</option>
                            <option value="PUBLIC" ${isPublic ? 'selected' : ''}>PUBLIC</option>
                        </select>
                    `,
                    actions: `
                        <button class="edit-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-500 transition-colors mr-4" data-id="${f._id}">EDIT SCHEMA</button>
                        <button class="delete-btn text-xs font-black uppercase tracking-widest border-b-2 border-red-500 text-red-500 hover:text-red-700 transition-colors" data-id="${f._id}">DELETE</button>
                    `
                };
            });
            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();
            
            // Bind Preview Buttons
            this.container.querySelectorAll('.preview-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const formId = e.target.dataset.id;
                    const title = e.target.dataset.title;
                    const previewMount = this.container.querySelector('#form-preview-mount');
                    previewMount.innerHTML = '<p class="animate-pulse-soft text-xs font-bold">Loading Preview...</p>';
                    this.container.querySelector('#preview-modal-container').classList.remove('hidden');
                    
                    try {
                        const res = await http.get(`/forms/${formId}`);
                        const schema = res.data?.data || res.data || res;
                        // Ensure sections array exists
                        if(!schema.sections) schema.sections = [];
                        
                        const formRenderer = new FormRenderer(previewMount, schema);
                        formRenderer.mount();
                    } catch (err) {
                        previewMount.innerHTML = '<p class="text-red-500 font-bold">Failed to load preview</p>';
                    }
                });
            });

            // Bind Visibility Toggles
            this.container.querySelectorAll('.visibility-toggle').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const formId = e.target.dataset.id;
                    const newVisibility = e.target.value;
                    try {
                        await http.put(`/forms/${formId}`, { visibility: newVisibility });
                        Toast.success(`Visibility updated to ${newVisibility}`);
                        this.loadMasterForms(); // Reload to update colors
                    } catch (err) {
                        Toast.error('Failed to update visibility');
                        this.loadMasterForms(); // Reset to previous state
                    }
                });
            });

            // Bind Edit Schema Buttons
            this.container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const formId = e.target.dataset.id;
                    const builderMount = this.container.querySelector('#form-builder-mount');
                    builderMount.innerHTML = '<p class="text-xs font-bold animate-pulse-soft">Loading Form Schema...</p>';
                    this.container.querySelector('#builder-container').classList.remove('hidden');
                    
                    try {
                        const res = await http.get(`/forms/${formId}`);
                        const schema = res.data?.data || res.data || res;
                        if(!schema.sections) schema.sections = [];
                        
                        // Load into store
                        formStore.loadState(schema);
                        
                        builderMount.innerHTML = ''; // Clear loading
                        const formBuilder = new FormBuilder(builderMount);
                        formBuilder.mount();
                        
                        // Listen for save
                        builderMount.addEventListener('schema-saved', async (event) => {
                            const updatedSchema = event.detail;
                            try {
                                await http.put(`/forms/${formId}`, updatedSchema);
                                Toast.success('Form Schema Saved!');
                            } catch (e) {
                                Toast.error('Failed to save schema');
                            }
                        }, { once: true }); // Ensure we don't stack listeners
                        
                    } catch(err) {
                        builderMount.innerHTML = '<p class="text-red-500 font-bold text-xs uppercase">Failed to load form schema</p>';
                    }
                });
            });

            // Bind Delete Buttons
            this.container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(!confirm('Are you sure you want to delete this master form?')) return;
                    const formId = e.target.dataset.id;
                    try {
                        await http.delete(`/forms/${formId}`);
                        Toast.success('Form Deleted');
                        this.loadMasterForms();
                    } catch (err) {
                        Toast.error('Failed to delete form');
                    }
                });
            });

        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = 'Failed to load templates.';
        }
    }
}
