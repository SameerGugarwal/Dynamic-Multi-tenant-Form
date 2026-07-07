
import http from '../../services/http.mjs';

export default class DashboardView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="mb-12 border-b border-surface-200 pb-4">
                    <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">DASHBOARD</h2>
                    <p class="text-slate-500 font-bold font-medium text-xs mt-2">LIVE STATISTICS</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12" id="stats-grid">
                    LOADING...
                </div>
                
                <div class="mb-12">
                    <h3 class="text-2xl font-semibold uppercase mb-4 tracking-tighter">ASSIGNED TEMPLATES</h3>
                    <p class="text-slate-500 font-bold font-medium text-[10px] mb-4">TEMPLATES ASSIGNED TO YOU BY YOUR CENTER ADMIN</p>
                    <div id="assigned-table-container">
                        <div class="h-32 border border-surface-200 rounded-lg bg-surface-50 flex items-center justify-center">
                            <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING ASSIGNED TEMPLATES...</span>
                        </div>
                    </div>
                </div>
                
                <div id="builder-container" class="mt-12 hidden border-t-4 border-surface-900 pt-8">
                    <h3 class="text-2xl font-semibold uppercase mb-4" id="builder-title">BUILDER PREVIEW</h3>
                    <div id="form-builder-mount"></div>
                </div>
            </div>
        `;
        await this.loadStats();
    }

    async loadStats() {
        try {
            const { FormService } = await import('../../modules/forms/form.service.mjs');
            const { formStore } = await import('../../dynamic-form/state/formStore.mjs');
            const { Table } = await import('../../components/table/Table.mjs');
            const { FormBuilder } = await import('../../dynamic-form/builder/FormBuilder.mjs');
            const { Toast } = await import('../../components/toast/Toast.mjs');

            const res = await http.get('/dashboard/stats');
            const data = (res.data) ? res.data : (res || { centers: 0, orgs: 0, forms: 0, submissions: 0 });
            
            this.container.querySelector('#stats-grid').innerHTML = `
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-6 shadow-sm">
                    <div class="text-[10px] font-medium tracking-wide text-slate-500 mb-2">ORG USERS</div>
                    <div class="text-5xl font-heading font-semibold text-brand-600">${data.users || 0}</div>
                </div>
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-6 shadow-sm">
                    <div class="text-[10px] font-medium tracking-wide text-slate-500 mb-2">ASSIGNED FORMS</div>
                    <div class="text-5xl font-heading font-semibold text-brand-600">${data.forms || 0}</div>
                </div>
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-6 shadow-sm">
                    <div class="text-[10px] font-medium tracking-wide text-slate-500 mb-2">SUBMISSIONS</div>
                    <div class="text-5xl font-heading font-semibold text-red-600">${data.submissions || 0}</div>
                </div>
            `;

            // Fetch Assigned Forms
            const assignedRes = await FormService.getAssignedForms();
            const assignedRaw = assignedRes.data || assignedRes || [];
            const assignedData = Array.isArray(assignedRaw) ? assignedRaw : (assignedRaw.data || []);

            // Fetch Local Forms to determine which ones have already been cloned
            const localRes = await FormService.getOrgForms();
            const localRaw = localRes.data || localRes || [];
            const localData = Array.isArray(localRaw) ? localRaw : (localRaw.data || []);
            
            const clonedMasterIds = localData.map(f => f.clonedFromId).filter(id => id);

            const assignedHeaders = ['TEMPLATE TITLE', 'ACTIONS'];
            const assignedRows = assignedData.map(f => {
                const isCloned = clonedMasterIds.includes(f._id);
                
                const actionButton = isCloned 
                    ? `<span class="text-xs font-medium tracking-wide px-3 py-1 bg-green-100 text-green-800 border border-surface-200 rounded-xl shadow-sm shadow-sm opacity-70 cursor-not-allowed">CLONED</span>`
                    : `<button class="edit-clone-btn text-xs font-medium tracking-wide px-3 py-1 bg-red-500 text-white border border-surface-200 rounded-xl shadow-sm shadow-sm  hover:shadow-none transition-all hover:bg-red-600" data-id="${f._id}">EDIT & CLONE</button>`;
                
                return {
                    title: `<span class="font-bold text-slate-800 font-medium">${f.title}</span>`,
                    actions: actionButton
                };
            });
            const assignedTable = new Table(assignedHeaders, assignedRows);
            this.container.querySelector('#assigned-table-container').innerHTML = assignedTable.render();

            // Bind Form Builder Logic
            const builderContainer = this.container.querySelector('#builder-container');
            const builderMount = this.container.querySelector('#form-builder-mount');
            let activeMasterId = null;

            builderMount.addEventListener('schema-saved', async (e) => {
                const payload = e.detail;
                try {
                    payload.clonedFromId = activeMasterId;
                    payload.status = 'DRAFT';
                    await FormService.createForm(payload);
                    Toast.success('Local copy successfully created! Go to the Forms tab to view it.');
                    
                    builderContainer.classList.add('hidden');
                    if (this.builderInstance) this.builderInstance.unmount();
                    this.loadStats();
                } catch (err) {
                    Toast.error('Failed to save schema.');
                }
            });

            this.container.querySelectorAll('.edit-clone-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const masterId = e.target.dataset.id;
                    activeMasterId = masterId;
                    this.container.querySelector('#builder-title').textContent = 'CLONE TEMPLATE';
                    
                    try {
                        const formRes = await FormService.getFormById(masterId);
                        const masterForm = formRes.data || formRes;
                        
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

        } catch (e) {
            console.error(e);
            this.container.querySelector('#stats-grid').innerHTML = '<div class="text-red-500 font-bold">Failed to load statistics.</div>';
            this.container.querySelector('#assigned-table-container').innerHTML = '<p class="text-red-500 font-bold p-6">Error loading data.</p>';
        }
    }
}
