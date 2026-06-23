import { Table } from '../../components/table/Table.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class UsersView {
    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        this.container.querySelector('#add-user-btn').addEventListener('click', () => {
            this.container.querySelector('#user-form-container').classList.toggle('hidden');
        });
        
        this.container.querySelector('#new-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('nu-name').value,
                email: document.getElementById('nu-email').value,
                password: document.getElementById('nu-pass').value,
                roleName: 'User'
            };
            try {
                await http.post('/users', payload);
                Toast.success('User Created!');
                this.loadData();
            } catch(err) {
                console.error(err);
                Toast.error('Failed to create user');
            }
        });

        await this.loadData();
    }
    
    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase">USERS DIRECTORY</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">SYSTEM-WIDE DIRECTORY</p>
                    </div>
                    <button id="add-user-btn" class="bg-surface-900 text-white px-4 py-2 font-bold">+ ADD USER</button>
                </div>
                <div id="user-form-container" class="hidden mb-8 bg-surface-50 border-2 border-surface-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <form id="new-user-form" class="flex gap-4 items-end">
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Name</label><input type="text" id="nu-name" class="w-full border-2 p-2 border-surface-900" required></div>
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Email</label><input type="email" id="nu-email" class="w-full border-2 p-2 border-surface-900" required></div>
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Password</label><input type="password" id="nu-pass" class="w-full border-2 p-2 border-surface-900" required></div>
                        <button type="submit" class="bg-brand-500 text-white font-bold p-3 h-11">CREATE</button>
                    </form>
                </div>
                <div id="table-container">LOADING...</div>
            </div>
        `;
    }

    async loadData() {
        this.container.querySelector('#table-container').innerHTML = "LOADING...";
        const headers = ['ID', 'NAME', 'ROLE', 'STATUS'];
        let rows = [];
        try {
            const { UserService } = await import('../../modules/users/user.service.mjs');
            const res = await UserService.getUsers();
            const rawData = res.data || res || [];
            const usersArray = Array.isArray(rawData) ? rawData : (rawData.data || []);
            rows = usersArray.map(u => ({ id: u._id, name: u.name, role: u.role, status: 'ACTIVE' }));
        } catch (e) {
            rows = [{ id: '-', name: 'Error', role: '-', status: '-' }];
        }
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
