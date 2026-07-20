import { Table } from '../../components/table/Table.mjs';
import http from '../../services/http.mjs';
import { Modal } from '../../components/modal/Modal.mjs';
import { FormService } from '../../modules/forms/form.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { FormBuilder } from '../../dynamic-form/builder/FormBuilder.mjs';
import { formStore } from '../../dynamic-form/state/formStore.mjs';
import { FormRenderer } from '../../dynamic-form/renderer/FormRenderer.mjs';
import Swal from 'sweetalert2';

export default class FormsView {
    constructor(match) {
        this.match = match;
        this.forms = [];
    }

    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        // Form creation using Modal instead of prompt()
        this.container.querySelector('#add-form-btn').addEventListener('click', () => {
            const bodyHTML = `
                <div class="space-y-4">
                    <div>
                        <label class="text-xs font-bold block mb-1">Form Title</label>
                        <input type="text" id="nf-title" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                    </div>
                </div>
            `;

            const createModal = new Modal('CREATE MASTER FORM', bodyHTML, async () => {
                const title = document.getElementById('nf-title').value;
                if (!title) return;
                try {
                    await FormService.createForm({ title, visibility: 'PRIVATE' });
                    Toast.success('Master Form Created!');
                    this.loadMasterForms();
                } catch (err) {
                    Toast.error('Failed to create form');
                }
            });
            createModal.open();
        });

        // Close builder container
        this.container.querySelector('#close-builder-btn').addEventListener('click', () => {
            const closeBuilder = () => {
                formStore.isDirty = false;
                this.container.querySelector('#builder-container').classList.add('hidden');
                this.loadMasterForms(); // Reload to reflect any potential builder changes
            };

            if (formStore.isDirty) {
                Swal.fire({
                    title: 'Unsaved Changes',
                    text: 'You have unsaved changes. What would you like to do?',
                    icon: 'warning',
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Save Changes',
                    denyButtonText: 'Discard',
                    cancelButtonText: 'Keep Editing',
                    confirmButtonColor: '#2357b1',
                    denyButtonColor: '#ef4444'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const updatedSchema = formStore.getState();
                        try {
                            await FormService.updateForm(updatedSchema._id, updatedSchema);
                            Toast.success('Form Schema Saved!');
                            closeBuilder();
                        } catch (e) {
                            Toast.error('Failed to save schema');
                        }
                    } else if (result.isDenied) {
                        closeBuilder();
                    }
                });
            } else {
                closeBuilder();
            }
        });

        await this.loadMasterForms();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">GLOBAL FORMS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">MASTER TEMPLATE MANAGEMENT</p>
                    </div>
                    <button id="add-form-btn" class="bg-brand-700 text-white hover:bg-brand-800 transition-colors px-4 py-2 font-bold  transition-colors">+ CREATE MASTER FORM</button>
                </div>
                
                <div id="table-container">
                    <div class="h-64 border border-surface-200 rounded-lg bg-surface-50 flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
                    </div>
                </div>
                
                <div id="builder-container" class="mt-12 hidden border-t-4 border-surface-900 pt-8 relative">
                    <button id="close-builder-btn" class="absolute top-8 right-0 text-slate-500 hover:text-slate-800 font-bold font-medium text-xs">CLOSE BUILDER X</button>
                    <h3 class="text-2xl font-semibold uppercase mb-4">FORM BUILDER</h3>
                    <div id="form-builder-mount" class="bg-white border border-surface-200 rounded-xl shadow-sm p-4"></div>
                </div>
            </div>
        `;
    }

    async loadMasterForms() {
        try {
            const res = await FormService.getForms();
            const rawData = res.data || res || [];
            this.forms = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['MASTER FORM ID', 'TITLE', 'VISIBILITY', 'ACTIONS'];
            
            const rows = this.forms.map(f => {
                const isPublic = f.visibility === 'PUBLIC';
                return {
                    id: f._id || f.id || 'N/A',
                    title: `<button class="preview-btn font-bold font-medium text-brand-500 hover:text-brand-700 transition-colors" data-id="${f._id}" data-title="${f.title}">${f.title}</button>`,
                    visibility: `
                        <select class="visibility-toggle text-xs font-bold p-1 border border-surface-200 rounded-xl shadow-sm ${isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}" data-id="${f._id}">
                            <option value="PRIVATE" ${!isPublic ? 'selected' : ''}>PRIVATE</option>
                            <option value="PUBLIC" ${isPublic ? 'selected' : ''}>PUBLIC</option>
                        </select>
                    `,
                    actions: `
                        <button class="edit-schema-btn text-xs font-medium tracking-wide border-b border-surface-200 hover:text-brand-500 transition-colors mr-4" data-id="${f._id}">EDIT SCHEMA</button>
                        <button class="delete-btn text-xs font-medium tracking-wide border-b-2 border-red-500 text-red-500 hover:text-red-700 transition-colors" data-id="${f._id}">DELETE</button>
                    `
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();
            
            // Bind Preview Buttons using Modal.mjs
            this.container.querySelectorAll('.preview-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const formId = e.target.dataset.id;
                    const title = e.target.dataset.title;
                    
                    // Create an empty modal first
                    const previewModal = new Modal(`PREVIEW: ${title}`, '<div id="live-preview-mount"><p class="animate-pulse-soft text-xs font-bold py-4">Loading Preview...</p></div>', null);
                    previewModal.open();
                    
                    try {
                        const res = await FormService.getFormById(formId);
                        const schema = res.data?.data || res.data || res;
                        if(!schema.sections) schema.sections = [];
                        
                        const mountPoint = document.getElementById('live-preview-mount');
                        if (mountPoint) {
                            mountPoint.innerHTML = ''; // clear loading text
                            const formRenderer = new FormRenderer(mountPoint, schema);
                            formRenderer.mount();
                        }
                    } catch (err) {
                        const mountPoint = document.getElementById('live-preview-mount');
                        if (mountPoint) mountPoint.innerHTML = '<p class="text-red-500 font-bold">Failed to load preview</p>';
                    }
                });
            });

            // Bind Visibility Toggles
            this.container.querySelectorAll('.visibility-toggle').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const formId = e.target.dataset.id;
                    const newVisibility = e.target.value;
                    try {
                        await FormService.updateForm(formId, { visibility: newVisibility });
                        Toast.success(`Visibility updated to ${newVisibility}`);
                        this.loadMasterForms(); 
                    } catch (err) {
                        Toast.error('Failed to update visibility');
                        this.loadMasterForms(); 
                    }
                });
            });

            // Bind Edit Schema Buttons
            this.container.querySelectorAll('.edit-schema-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const formId = e.target.dataset.id;
                    let builderMount = this.container.querySelector('#form-builder-mount');
                    // Clone the element to completely wipe out any previous event listeners from other forms
                    const clonedMount = builderMount.cloneNode(false);
                    builderMount.parentNode.replaceChild(clonedMount, builderMount);
                    builderMount = clonedMount;
                    
                    builderMount.innerHTML = '<p class="text-xs font-bold animate-pulse-soft py-4">Loading Form Schema...</p>';
                    this.container.querySelector('#builder-container').classList.remove('hidden');
                    
                    try {
                        const res = await FormService.getFormById(formId);
                        const schema = res.data?.data || res.data || res;
                        if(!schema.sections) schema.sections = [];
                        
                        // Load into store
                        formStore.loadState(schema);
                        
                        builderMount.innerHTML = ''; // Clear loading
                        const formBuilder = new FormBuilder(builderMount);
                        formBuilder.mount();
                        
                        // Listen for save (Removed { once: true } so you can save multiple times)
                        builderMount.addEventListener('schema-saved', async (event) => {
                            const updatedSchema = event.detail;
                            try {
                                await FormService.updateForm(formId, updatedSchema);
                                Toast.success('Form Schema Saved!');
                                formStore.isDirty = false; // Reset dirty flag after saving
                            } catch (e) {
                                Toast.error('Failed to save schema');
                            }
                        });
                        
                    } catch(err) {
                        builderMount.innerHTML = '<p class="text-red-500 font-bold text-xs uppercase py-4">Failed to load form schema</p>';
                    }
                });
            });

            // Bind Delete Buttons
            this.container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if(!confirm('Are you sure you want to delete this master form?')) return;
                    const formId = e.target.dataset.id;
                    try {
                        await FormService.deleteForm(formId);
                        Toast.success('Form Deleted');
                        this.loadMasterForms();
                    } catch (err) {
                        Toast.error('Failed to delete form');
                    }
                });
            });

        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold font-medium">Failed to load templates.</p>
                </div>
            `;
        }
    }
}
