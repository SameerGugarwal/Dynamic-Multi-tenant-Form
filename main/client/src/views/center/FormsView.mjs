import { Table } from '../../components/table/Table.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class FormsView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.renderSkeleton();
        await this.loadData();
    }

    renderSkeleton() {
        return `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">ASSIGN MASTER FORMS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">ASSIGN TEMPLATES TO YOUR ORGANIZATIONS</p>
                    </div>
                </div>
                
                <div id="table-container">
                    <div class="h-64 border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            // 1. Fetch Master Forms
            const formsRes = await http.get('/forms/master');
            const formsRaw = formsRes.data?.data || formsRes.data || [];
            const forms = Array.isArray(formsRaw) ? formsRaw : [];

            // 2. Fetch Centers Organizations (for the dropdown)
            const orgsRes = await http.get('/organizations/my-center');
            const orgsRaw = orgsRes.data?.data || orgsRes.data || [];
            const orgs = Array.isArray(orgsRaw) ? orgsRaw : [];

            if (orgs.length === 0) {
                this.container.querySelector('#table-container').innerHTML = `
                    <div class="border-2 border-surface-900 p-8 text-center bg-white flex flex-col items-center justify-center">
                        <p class="text-surface-900 text-sm font-black uppercase tracking-widest">NO ORGANIZATIONS FOUND</p>
                        <p class="text-surface-500 text-xs font-bold uppercase tracking-widest mt-2">You must add an organization to this center before assigning forms.</p>
                    </div>
                `;
                return;
            }

            const orgOptions = orgs.map(org => `<option value="${org._id}">${org.name}</option>`).join('');
            
            const headers = ['TEMPLATE TITLE', 'ASSIGN TO ORGANIZATION', 'ACTIONS'];
            
            const rows = forms.map(form => {
                return {
                    title: `<span class="font-bold text-surface-900 uppercase tracking-widest">${form.title}</span>`,
                    assignTo: `
                        <select class="target-org-select text-xs font-bold p-2 border-2 border-surface-900 bg-surface-50 w-full" data-form="${form._id}">
                            <option value="" disabled selected>Select Organization...</option>
                            ${orgOptions}
                        </select>
                    `,
                    actions: `<button class="assign-btn text-xs font-black uppercase tracking-widest px-4 py-2 bg-brand-500 text-white border-2 border-surface-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all" data-id="${form._id}">ASSIGN</button>`
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Assign Buttons
            this.container.querySelectorAll('.assign-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const masterId = e.target.dataset.id;
                    const selectEl = this.container.querySelector(`.target-org-select[data-form="${masterId}"]`);
                    const targetOrgId = selectEl.value;
                    
                    if (!targetOrgId) {
                        Toast.error('Please select a target organization first.');
                        return;
                    }

                    if(!confirm('Are you sure you want to assign this template to the selected organization?')) return;
                    
                    try {
                        const { FormService } = await import('../../modules/forms/form.service.mjs');
                        await FormService.assignForm(masterId, targetOrgId);
                        Toast.success('Form Successfully Assigned!');
                        // Reset dropdown
                        selectEl.value = '';
                    } catch (err) {
                        Toast.error('Failed to clone form to organization.');
                    }
                });
            });

        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">Failed to load templates or organizations.</p>
                </div>
            `;
        }
    }
}
