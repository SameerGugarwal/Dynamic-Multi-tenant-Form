import { Table } from '../../components/table/Table.mjs';
import { OrganizationService } from '../../modules/organizations/organization.service.mjs';

export default class OrganizationsView {
    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        await this.loadData();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">NODE ORGANIZATIONS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">TENANTS IN THIS CENTER</p>
                    </div>
                    <button class="border-2 border-surface-900 text-surface-900 hover:bg-surface-900 hover:text-white px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors">
                        + ADD TENANT
                    </button>
                </div>
                <div id="table-container">LOADING...</div>
            </div>
        `;
    }

    async loadData() {
        const headers = ['ORG ID', 'NAME', 'STATUS', 'ACTIONS'];
        let rows = [];
        try {
            const res = await OrganizationService.fetchAll();
            const data = res.data || [];
            rows = data.map(org => ({
                id: org._id || org.id,
                name: org.name,
                status: org.isActive ? '<span class="text-green-600">ACTIVE</span>' : '<span class="text-red-600">INACTIVE</span>',
                actions: 'MANAGE'
            }));
        } catch (e) {
            console.error('Failed to load orgs:', e);
            rows = [{ id: '-', name: 'Failed to load', status: '-', actions: '-' }];
        }
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
