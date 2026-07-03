import { Table } from '../../components/table/Table.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';
import { UserService } from '../../modules/users/user.service.mjs';
import { TokenService } from '../../services/token.service.mjs';

export default class UsersView {
    constructor(match) {
        this.match = match;
        this.users = [];
    }

    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        // Add User Form Toggle
        this.container.querySelector('#add-user-btn').addEventListener('click', () => {
            this.container.querySelector('#user-form-container').classList.toggle('hidden');
        });
        
        // Handle User Creation
        this.container.querySelector('#new-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('nu-name').value,
                email: document.getElementById('nu-email').value,
                password: document.getElementById('nu-pass').value,
                roleName: 'User'
            };
            try {
                await UserService.createUser(payload);
                Toast.success('User Created Successfully!');
                this.container.querySelector('#user-form-container').classList.add('hidden');
                document.getElementById('new-user-form').reset();
                await this.loadData();
            } catch(err) {
                console.error(err);
                Toast.error(err.message || 'Failed to create user');
            }
        });

        await this.loadData();
    }
    
    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">USERS DIRECTORY</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">SYSTEM-WIDE DIRECTORY</p>
                    </div>
                    <button id="add-user-btn" class="bg-surface-900 text-white px-4 py-2 font-bold hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+ ADD USER</button>
                </div>
                
                <div id="user-form-container" class="hidden mb-8 bg-surface-50 border-2 border-surface-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <form id="new-user-form" class="flex gap-4 items-end">
                        <div class="flex-1"><label class="text-xs font-bold uppercase tracking-widest block mb-1">Name</label><input type="text" id="nu-name" class="w-full border-2 p-3 border-surface-900 focus:outline-none focus:border-brand-500 font-bold" required></div>
                        <div class="flex-1"><label class="text-xs font-bold uppercase tracking-widest block mb-1">Email</label><input type="email" id="nu-email" class="w-full border-2 p-3 border-surface-900 focus:outline-none focus:border-brand-500 font-bold" required></div>
                        <div class="flex-1"><label class="text-xs font-bold uppercase tracking-widest block mb-1">Password</label><input type="password" id="nu-pass" class="w-full border-2 p-3 border-surface-900 focus:outline-none focus:border-brand-500 font-bold" required></div>
                        <button type="submit" class="bg-brand-500 text-white font-black uppercase tracking-widest px-8 py-3 h-13 border-2 border-surface-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all">CREATE</button>
                    </form>
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
            // Fetch users, centers, and orgs concurrently
            const [usersRes, centersRes, orgsRes] = await Promise.all([
                UserService.getUsers(),
                http.get('/centers'),
                http.get('/organizations')
            ]);
            
            const rawUsers = usersRes.data || usersRes || [];
            this.users = Array.isArray(rawUsers) ? rawUsers : (rawUsers.data || []);
            
            const rawCenters = centersRes.data?.data || centersRes.data || [];
            const centers = Array.isArray(rawCenters) ? rawCenters : [];
            
            const rawOrgs = orgsRes.data?.data || orgsRes.data || [];
            const orgs = Array.isArray(rawOrgs) ? rawOrgs : [];
            
            const centerOptions = centers.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
            const orgOptions = orgs.map(o => `<option value="${o._id}">${o.name}</option>`).join('');
            
            const headers = ['USER', 'ROLE', 'CENTER ASSIGNMENT', 'ORG ASSIGNMENT', 'STATUS', 'ACTIONS'];
            
            const currentUserId = TokenService.decodeToken()?.id || TokenService.decodeToken()?._id;

            const rows = this.users.map(u => {
                const isActive = u.isActive !== false;
                const roleName = u.role?.name || 'Unknown';
                const centerId = u.centerId?._id || u.centerId || '';
                const orgId = u.organizationId?._id || u.organizationId || '';
                
                const isCurrentUser = String(u._id) === String(currentUserId);
                
                return {
                    user: `
                        <div>
                            <p class="font-bold text-surface-900 uppercase">${u.name}</p>
                            <p class="text-xs text-surface-500">${u.email}</p>
                        </div>
                    `,
                    role: `
                        <select class="role-toggle text-xs font-bold p-1 border-2 border-surface-900 bg-surface-50" data-id="${u._id}" ${isCurrentUser ? 'disabled title="You cannot demote yourself"' : ''}>
                            <option value="User" ${roleName === 'User' ? 'selected' : ''}>User</option>
                            <option value="Organization Admin" ${roleName === 'Organization Admin' ? 'selected' : ''}>Org Admin</option>
                            <option value="Center Admin" ${roleName === 'Center Admin' ? 'selected' : ''}>Center Admin</option>
                            <option value="Super Admin" ${roleName === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
                        </select>
                    `,
                    center: roleName === 'Center Admin' 
                        ? `
                            <select class="center-assign-toggle text-xs font-bold p-1 border-2 border-surface-900 bg-surface-50 w-full" data-id="${u._id}" ${isCurrentUser ? 'disabled' : ''}>
                                <option value="">-- No Center --</option>
                                ${centers.map(c => `<option value="${c._id}" ${centerId === c._id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        `
                        : `<span class="text-xs text-surface-400 font-bold uppercase tracking-widest">N/A</span>`,
                    organization: (roleName === 'Organization Admin' || roleName === 'User')
                        ? `
                            <select class="org-assign-toggle text-xs font-bold p-1 border-2 border-surface-900 bg-surface-50 w-full" data-id="${u._id}" ${isCurrentUser ? 'disabled' : ''}>
                                <option value="">-- No Organization --</option>
                                ${orgs.map(o => `<option value="${o._id}" ${orgId === o._id ? 'selected' : ''}>${o.name}</option>`).join('')}
                            </select>
                        `
                        : `<span class="text-xs text-surface-400 font-bold uppercase tracking-widest">N/A</span>`,
                    status: `
                        <button class="status-toggle text-xs font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900 ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}" data-id="${u._id}" data-active="${isActive}" ${isCurrentUser ? 'disabled title="You cannot deactivate yourself"' : ''}>
                            ${isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                    `,
                    actions: `
                        <button class="reset-pwd-btn text-xs font-black text-brand-500 uppercase tracking-widest border-b-2 border-brand-500 hover:text-brand-700 hover:border-brand-700 transition-colors" data-id="${u._id}">RESET PWD</button>
                    `
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Role Toggles
            this.container.querySelectorAll('.role-toggle').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const userId = e.target.dataset.id;
                    const newRole = e.target.value;
                    try {
                        await UserService.updateUser(userId, { roleName: newRole });
                        Toast.success(`Role updated to ${newRole}`);
                        await this.loadData();
                    } catch (err) {
                        Toast.error('Failed to update role');
                        await this.loadData(); 
                    }
                });
            });
            
            // Bind Center Assignment Toggles
            this.container.querySelectorAll('.center-assign-toggle').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const userId = e.target.dataset.id;
                    const newCenter = e.target.value;
                    try {
                        await UserService.updateUser(userId, { centerId: newCenter || null });
                        Toast.success('Center assignment updated!');
                    } catch (err) {
                        Toast.error('Failed to assign Center');
                        this.loadData(); 
                    }
                });
            });

            // Bind Org Assignment Toggles
            this.container.querySelectorAll('.org-assign-toggle').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const userId = e.target.dataset.id;
                    const newOrg = e.target.value;
                    try {
                        await UserService.updateUser(userId, { organizationId: newOrg || null });
                        Toast.success('Organization assignment updated!');
                    } catch (err) {
                        Toast.error('Failed to assign Organization');
                        this.loadData(); 
                    }
                });
            });

            // Bind Status Toggles
            this.container.querySelectorAll('.status-toggle').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.id;
                    const currentActive = e.target.dataset.active === 'true';
                    try {
                        await UserService.updateUser(userId, { isActive: !currentActive });
                        Toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`);
                        this.loadData();
                    } catch (err) {
                        Toast.error('Failed to update status');
                    }
                });
            });

            // Bind Reset Password
            this.container.querySelectorAll('.reset-pwd-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.id;
                    const newPassword = prompt("Enter the new password for this user (Min 6 characters):");
                    if (!newPassword) return; // User cancelled

                    if (newPassword.length < 6) {
                        Toast.error("Password must be at least 6 characters.");
                        return;
                    }

                    try {
                        await http.post(`/users/${userId}/reset-password`, { newPassword });
                        Toast.success("Password has been successfully reset!");
                    } catch (err) {
                        Toast.error(err.message || 'Failed to reset password');
                    }
                });
            });

        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">Failed to load users.</p>
                </div>
            `;
        }
    }
}
