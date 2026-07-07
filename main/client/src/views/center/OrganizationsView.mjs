import { Table } from '../../components/table/Table.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class OrganizationsView {
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
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">MY ORGANIZATIONS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">ORGANIZATIONS UNDER THIS CENTER</p>
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
            // Using /organizations/my-center to get orgs for this specific center admin
            const res = await http.get('/organizations/my-center');
            const rawData = res.data?.data || res.data || [];
            const orgs = Array.isArray(rawData) ? rawData : [];
            
            const headers = ['ORGANIZATION NAME', 'CONTACT EMAIL', 'STATUS'];
            
            const rows = orgs.map(org => {
                const isActive = org.isActive !== false;
                return {
                    name: `<span class="font-bold text-slate-800 font-medium">${org.name}</span>`,
                    email: org.contactEmail || 'N/A',
                    status: `
                        <button class="status-toggle text-xs font-medium tracking-wide px-2 py-1 border border-surface-200 rounded-xl shadow-sm ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}" data-id="${org._id}" data-active="${isActive}">
                            ${isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                    `
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Status Toggles
            this.container.querySelectorAll('.status-toggle').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const orgId = e.target.dataset.id;
                    const currentActive = e.target.dataset.active === 'true';
                    try {
                        await http.patch(`/organizations/${orgId}`, { isActive: !currentActive });
                        Toast.success(`Organization ${!currentActive ? 'activated' : 'deactivated'}`);
                        await this.loadData();
                    } catch (err) {
                        Toast.error('Failed to update status');
                    }
                });
            });
        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold font-medium">Failed to load organizations.</p>
                </div>
            `;
        }
    }
}
