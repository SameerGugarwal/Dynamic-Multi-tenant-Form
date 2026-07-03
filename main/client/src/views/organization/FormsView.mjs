
import { Table } from '../../components/table/Table.mjs';
import http from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { FormBuilder } from '../../dynamic-form/builder/FormBuilder.mjs';

export default class FormsView {
    async mount(container) {
        this.container = container;
        this.render();
        await this.loadData();
    }

    render() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">ORGANIZATION FORMS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">ASSIGNED TEMPLATES & LOCAL FORMS</p>
                    </div>
                </div>



                <div class="mb-12">
                    <h3 class="text-2xl font-black uppercase mb-4 tracking-tighter">ACTIVE LOCAL FORMS</h3>
                    <p class="text-surface-500 font-bold uppercase tracking-widest text-[10px] mb-4">FORMS YOU HAVE CLONED AND PREPARED FOR YOUR USERS</p>
                    <div id="local-table-container">
                        <div class="h-32 border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                            <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING LOCAL FORMS...</span>
                        </div>
                    </div>
                </div>
                
                <div id="builder-container" class="mt-12 hidden border-t-4 border-surface-900 pt-8">
                    <h3 class="text-2xl font-black uppercase mb-4" id="builder-title">BUILDER PREVIEW</h3>
                    <div id="form-builder-mount"></div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const { FormService } = await import('../../modules/forms/form.service.mjs');
            const { formStore } = await import('../../dynamic-form/state/formStore.mjs');

            // Fetch Local Forms
            const localRes = await FormService.getOrgForms();
            const localRaw = localRes.data || localRes || [];
            const localData = Array.isArray(localRaw) ? localRaw : (localRaw.data || []);
            
            const localHeaders = ['FORM TITLE', 'STATUS', 'ACTIONS'];
            const localRows = localData.map(f => ({
                title: `<span class="font-bold text-surface-900 uppercase tracking-widest">${f.title}</span>`,
                status: `<span class="text-xs font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900 ${f.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${f.status || 'DRAFT'}</span>`,
                actions: `
                    <div class="flex gap-4">
                        <button class="toggle-status-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 ${f.status === 'PUBLISHED' ? 'hover:text-yellow-600' : 'hover:text-green-600'} transition-colors" data-id="${f._id}" data-current-status="${f.status || 'DRAFT'}">
                            ${f.status === 'PUBLISHED' ? 'UNPUBLISH' : 'PUBLISH'}
                        </button>
                        <button class="edit-local-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-600 transition-colors" data-id="${f._id}">EDIT SCHEMA</button>
                        <button class="delete-local-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-red-600 transition-colors" data-id="${f._id}">DELETE</button>
                    </div>
                `
            }));
            const localTable = new Table(localHeaders, localRows);
            this.container.querySelector('#local-table-container').innerHTML = localTable.render();

            // Bind Form Builder Logic
            const builderContainer = this.container.querySelector('#builder-container');
            const builderMount = this.container.querySelector('#form-builder-mount');
            
            let currentBuilderMode = null; // 'CLONE' or 'EDIT'
            let activeMasterId = null;
            let activeLocalId = null;

            // Handle Save Event
            builderMount.addEventListener('schema-saved', async (e) => {
                const payload = e.detail;
                try {
                    if (currentBuilderMode === 'CLONE') {
                        payload.clonedFromId = activeMasterId;
                        payload.status = 'DRAFT';
                        await FormService.createForm(payload);
                        Toast.success('Local copy successfully created!');
                    } else if (currentBuilderMode === 'EDIT') {
                        await FormService.updateForm(activeLocalId, payload);
                        Toast.success('Local form updated successfully!');
                    }
                    
                    builderContainer.classList.add('hidden');
                    if (this.builderInstance) this.builderInstance.unmount();
                    this.loadData();
                } catch (err) {
                    Toast.error('Failed to save schema.');
                }
            });

            // Bind EDIT & CLONE (Assigned Templates)
            this.container.querySelectorAll('.edit-clone-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const masterId = e.target.dataset.id;
                    activeMasterId = masterId;
                    currentBuilderMode = 'CLONE';
                    this.container.querySelector('#builder-title').textContent = 'CLONE TEMPLATE';
                    
                    try {
                        const formRes = await FormService.getFormById(masterId);
                        const masterForm = formRes.data || formRes;
                        
                        // Load into state
                        const currentState = formStore.getState();
                        formStore.loadState({
                            ...currentState,
                            title: `${masterForm.title} (Local Copy)`,
                            description: masterForm.description || '',
                            sections: (masterForm.sections && masterForm.sections.length > 0) ? masterForm.sections : []
                        });
                        
                        builderContainer.classList.remove('hidden');
                        if (this.builderInstance) this.builderInstance.unmount();
                        this.builderInstance = new FormBuilder(builderMount);
                        this.builderInstance.mount();
                        builderContainer.scrollIntoView({ behavior: 'smooth' });
                    } catch (err) {
                        Toast.error('Failed to load master form details.');
                    }
                });
            });
            // Bind TOGGLE STATUS (Local Forms)
            this.container.querySelectorAll('.toggle-status-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const localId = e.target.dataset.id;
                    const currentStatus = e.target.dataset.currentStatus;
                    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
                    
                    try {
                        const formRes = await FormService.getFormById(localId);
                        const localForm = formRes.data || formRes;
                        
                        await FormService.updateForm(localId, { ...localForm, status: newStatus });
                        Toast.success(`Form successfully ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}!`);
                        this.loadData();
                    } catch (err) {
                        Toast.error('Failed to change form status.');
                    }
                });
            });

            // Bind EDIT SCHEMA (Local Forms)
            this.container.querySelectorAll('.edit-local-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const localId = e.target.dataset.id;
                    activeLocalId = localId;
                    currentBuilderMode = 'EDIT';
                    this.container.querySelector('#builder-title').textContent = 'EDIT LOCAL FORM';
                    
                    try {
                        const formRes = await FormService.getFormById(localId);
                        const localForm = formRes.data || formRes;
                        
                        // Load into state
                        const currentState = formStore.getState();
                        formStore.loadState({
                            ...currentState,
                            title: localForm.title,
                            description: localForm.description || '',
                            sections: (localForm.sections && localForm.sections.length > 0) ? localForm.sections : []
                        });
                        
                        builderContainer.classList.remove('hidden');
                        if (this.builderInstance) this.builderInstance.unmount();
                        this.builderInstance = new FormBuilder(builderMount);
                        this.builderInstance.mount();
                        builderContainer.scrollIntoView({ behavior: 'smooth' });
                    } catch (err) {
                        Toast.error('Failed to load local form details.');
                    }
                });
            });

            // Bind DELETE (Local Forms)
            this.container.querySelectorAll('.delete-local-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const localId = e.target.dataset.id;
                    if(!confirm('Are you sure you want to permanently delete this form? This action cannot be undone.')) return;
                    
                    try {
                        await FormService.deleteForm(localId);
                        Toast.success('Form deleted successfully.');
                        // Hide builder if deleting the active one
                        if(activeLocalId === localId) {
                            builderContainer.classList.add('hidden');
                        }
                        this.loadData();
                    } catch (err) {
                        Toast.error('Failed to delete form.');
                    }
                });
            });

        } catch (e) {
            Toast.error('Failed to load forms.');
            this.container.querySelector('#local-table-container').innerHTML = '<p class="text-red-500 font-bold p-6">Error loading data.</p>';
            if(this.container.querySelector('#assigned-table-container')) {
                this.container.querySelector('#assigned-table-container').innerHTML = '<p class="text-red-500 font-bold p-6">Error loading data.</p>';
            }
        }
    }
}
