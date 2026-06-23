import { Table } from '../../components/table/Table.mjs';
import { UserService } from '../../modules/users/user.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';

export default class UsersView {
    constructor(match) {
        this.match = match;
        this.users = [];
    }

    async mount(container) {
        this.container = container;
        container.innerHTML = this.renderSkeleton();
        
        await this.loadData();
    }

    renderSkeleton() {
        return `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">EMPLOYEES</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">USER ACCESS MANAGEMENT</p>
                    </div>
                    <button id="add-user-btn" class="border-2 border-surface-900 text-surface-900 hover:bg-surface-900 hover:text-white px-6 py-3 font-bold uppercase tracking-widest text-xs transition-colors">
                        + INVITE USER
                    </button>
                </div>
                
                <div id="table-container">
                    <div class="h-64 border-2 border-surface-200 bg-surface-50 animate-pulse-soft flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs">LOADING DATA...</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const response = await UserService.getUsers();
            this.users = response.data || response || [];
            
            const headers = ['USER ID', 'NAME', 'EMAIL', 'ROLE', 'ACTIONS'];
            
            if (!this.users.length) {
                this.users = [
                    { id: 'USR-101', name: 'John Doe', email: 'john@example.com', role: 'User' },
                    { id: 'USR-102', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
                ];
            }

            const rows = this.users.map(user => ({
                id: user.id || user._id || 'N/A',
                name: user.name || 'N/A',
                email: user.email || 'N/A',
                role: user.role?.name || user.role || 'User',
                actions: `<button class="text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-red-600 transition-colors">REVOKE</button>`
            }));

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

        } catch (error) {
            Toast.error('Failed to load users');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }
}
