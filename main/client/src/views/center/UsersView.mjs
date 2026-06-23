import { Table } from '../../components/table/Table.mjs';

export default class UsersView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">NODE USERS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">CROSS-ORG DIRECTORY</p>
                    </div>
                </div>
                <div id="table-container">LOADING...</div>
            </div>
        `;
        
        const headers = ['USER', 'ORG', 'ROLE', 'STATUS'];
        let rows = [];
        try {
            const { usersService } = await import('../../modules/users/user.service.mjs');
            const res = await usersService.fetchAll();
            rows = (res.data || []).map(u => ({
                user: u.name, org: u.organizationId?.name || '-', role: u.role, status: 'ACTIVE'
            }));
        } catch (e) {
            rows = [{ user: 'Error', org: '-', role: '-', status: '-' }];
        }
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
