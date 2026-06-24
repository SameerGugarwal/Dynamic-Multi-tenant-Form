import { Table } from '../../components/table/Table.mjs';

export default class OrganizationsView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">ORGANIZATIONS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">Manage Center Organizations</p>
                    </div>
                    <button id="add-org-btn" class="bg-brand-500 text-white font-bold uppercase tracking-widest text-sm px-6 py-3 border-2 border-surface-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        ADD NEW
                    </button>
                </div>
                <div id="table-container" class="border-2 border-surface-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    LOADING...
                </div>
            </div>
        `;

        await this.loadData();
    }

    async loadData() {
        // Mocked Center Data
        const headers = ['ORG ID', 'NAME', 'STATUS', 'ACTIONS'];
        const rows = [
            { id: 'ORG-101', name: 'Local Corp', status: '<span class="text-green-600">ACTIVE</span>', actions: 'MANAGE' }
        ];
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
