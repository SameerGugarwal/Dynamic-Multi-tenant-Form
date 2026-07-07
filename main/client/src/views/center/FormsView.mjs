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
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">ASSIGN MASTER FORMS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">ASSIGN TEMPLATES TO YOUR ORGANIZATIONS</p>
                    </div>
                </div>
                
                <div id="table-container">
                    <div class="h-64 border border-surface-200 rounded-lg bg-surface-50 flex items-center justify-center">
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
                    <div class="border border-surface-200 rounded-xl shadow-sm p-8 text-center bg-white flex flex-col items-center justify-center">
                        <p class="text-slate-800 text-sm font-medium tracking-wide">NO ORGANIZATIONS FOUND</p>
                        <p class="text-slate-500 text-xs font-bold font-medium mt-2">You must add an organization to this center before assigning forms.</p>
                    </div>
                `;
                return;
            }

            const orgOptions = orgs.map(org => `<option value="${org._id}">${org.name}</option>`).join('');
            
            const headers = ['TEMPLATE TITLE', 'ASSIGN TO ORGANIZATION', 'ACTIONS'];
            
            const rows = forms.map(form => {
                return {
                    title: `<span class="font-bold text-slate-800 font-medium">${form.title}</span>`,
                    assignTo: `
                        <select class="target-org-select text-xs font-bold p-2 border border-surface-200 rounded-xl shadow-sm bg-surface-50 w-full" data-form="${form._id}">
                            <option value="" disabled selected>Select Organization...</option>
                            ${orgOptions}
                        </select>
                    `,
                    actions: `<button class="assign-btn text-xs font-medium tracking-wide px-4 py-2 bg-brand-700 text-white hover:bg-brand-800 border border-surface-200 rounded-xl shadow-sm shadow-sm  hover:shadow-none transition-all" data-id="${form._id}">ASSIGN</button>`
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
                <div class="border border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold font-medium">Failed to load templates or organizations.</p>
                </div>
            `;
        }
    }
}
