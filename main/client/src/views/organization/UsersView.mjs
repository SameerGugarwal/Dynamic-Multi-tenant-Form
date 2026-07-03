import { Table } from '../../components/table/Table.mjs';
import { UserService } from '../../modules/users/user.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

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
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
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
            const response = await UserService.getOrgUsers();
            const rawData = response.data || response || [];
            this.users = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['NAME', 'EMAIL', 'ROLE', 'STATUS', 'ACTIONS'];
            
            const rows = this.users.map(user => {
                const isActive = user.isActive !== false;
                return {
                    name: user.name || 'N/A',
                    email: user.email || 'N/A',
                    role: `<span class="font-bold text-surface-500 text-xs uppercase tracking-widest">${user.role?.name || 'User'}</span>`,
                    status: `
                        <span class="text-xs font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900 ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    `,
                    actions: `
                        <button class="revoke-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-red-600 transition-colors" data-id="${user._id || user.id}" data-active="${isActive}">
                            ${isActive ? 'REVOKE ACCESS' : 'RESTORE ACCESS'}
                        </button>
                    `
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Revoke/Restore buttons
            this.container.querySelectorAll('.revoke-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.id;
                    const currentActive = e.target.dataset.active === 'true';
                    if(!confirm(`Are you sure you want to ${currentActive ? 'revoke' : 'restore'} access for this user?`)) return;
                    
                    try {
                        await UserService.updateUser(userId, { isActive: !currentActive });
                        Toast.success(`Access ${currentActive ? 'Revoked' : 'Restored'}!`);
                        this.loadData();
                    } catch (err) {
                        Toast.error('Failed to update user access');
                    }
                });
            });

            // Bind Add User Button
            this.container.querySelector('#add-user-btn').addEventListener('click', () => {
                this.renderAddUserModal();
            });

        } catch (error) {
            Toast.error('Failed to load users');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }

    renderAddUserModal() {
        const modalId = 'add-user-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 bg-surface-900/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4';
        modal.innerHTML = `
            <div class="bg-white border-2 border-surface-900 shadow-[8px_8px_0px_#09090b] w-full max-w-md animate-slide-up">
                <div class="border-b-2 border-surface-900 p-6 flex justify-between items-center bg-brand-50">
                    <h3 class="font-heading font-black text-2xl uppercase tracking-tighter">INVITE USER</h3>
                    <button class="close-modal font-black text-xl hover:text-brand-600 transition-colors">&times;</button>
                </div>
                <form id="add-user-form" class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-surface-500 mb-1">Full Name</label>
                        <input type="text" id="new-user-name" class="w-full border-2 border-surface-900 p-2 font-bold" required>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-surface-500 mb-1">Email Address</label>
                        <input type="email" id="new-user-email" class="w-full border-2 border-surface-900 p-2 font-bold" required>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-surface-500 mb-1">Temporary Password (Min 6 chars)</label>
                        <input type="password" id="new-user-pass" class="w-full border-2 border-surface-900 p-2 font-bold" required minlength="6">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-surface-500 mb-1">Role</label>
                        <select id="new-user-role" class="w-full border-2 border-surface-900 p-2 font-bold" required>
                            <option value="User">Standard User</option>
                            <option value="Organization Admin">Organization Admin</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-brand-500 text-white font-bold h-12 uppercase tracking-widest hover:bg-brand-600 border-2 border-surface-900 shadow-[4px_4px_0px_#09090b] hover:shadow-none hover:translate-y-1 transition-all mt-6">
                        CREATE USER
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });

        modal.querySelector('#add-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = 'CREATING...';
            btn.disabled = true;

            const name = document.getElementById('new-user-name').value;
            const email = document.getElementById('new-user-email').value;
            const password = document.getElementById('new-user-pass').value;
            const roleName = document.getElementById('new-user-role').value;

            try {
                await http.post('/users', { name, email, password, roleName });
                Toast.success('User successfully created and assigned to your organization!');
                modal.remove();
                this.loadData();
            } catch (err) {
                Toast.error(err.message || 'Failed to create user');
                btn.innerHTML = 'CREATE USER';
                btn.disabled = false;
            }
        });
    }
}
