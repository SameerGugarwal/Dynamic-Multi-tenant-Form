import { ROUTES } from '../../constants/routes.mjs';
import { AuthService } from '../../modules/auth/auth.service.mjs';

export class Sidebar {
    constructor(role) {
        this.role = role || localStorage.getItem('topo_user_role_name');
        this.menuItems = this.getMenuItems(this.role);
    }

    getMenuItems(role) {
        switch (role) {
            case 'SUPER_ADMIN':
                return [
                    { name: 'Dashboard', path: ROUTES.SUPER_ADMIN_DASHBOARD },
                    { name: 'Centers', path: ROUTES.SUPER_ADMIN_CENTERS },
                    { name: 'Organizations', path: '/super-admin/organizations' },
                    { name: 'Global Forms', path: '/super-admin/forms' }
                ];
            case 'ORG_ADMIN':
                return [
                    { name: 'Dashboard', path: ROUTES.ORG_DASHBOARD },
                    { name: 'Form Builder', path: ROUTES.ORG_FORMS },
                    { name: 'Reports', path: '/organization/reports' }
                ];
            case 'CENTER_ADMIN':
                return [
                    { name: 'Dashboard', path: '/center/dashboard' },
                    { name: 'Users', path: '/center/users' }
                ];
            default:
                return [
                    { name: 'My Workspace', path: ROUTES.USER_DASHBOARD },
                    { name: 'My Forms', path: '/user/forms' },
                    { name: 'Profile', path: ROUTES.USER_PROFILE }
                ];
        }
    }

    render() {
        const currentPath = window.location.pathname;
        
        const linksHtml = this.menuItems.map(item => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            const activeClasses = isActive 
                ? 'bg-surface-900 text-white' 
                : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900';
            
            return `
                <li>
                    <a href="${item.path}" data-link class="flex items-center px-4 py-3 my-1 transition-colors text-sm uppercase tracking-widest font-bold ${activeClasses}">
                        <span class="mr-3 font-bold opacity-70">/</span>
                        <span>${item.name}</span>
                    </a>
                </li>
            `;
        }).join('');

        const formattedRole = this.role ? this.role.replace('_', ' ') : 'GUEST';

        return `
            <aside class="w-64 h-screen bg-white border-r-2 border-surface-900 text-surface-900 flex flex-col fixed left-0 top-0 z-40 animate-fade-in">
                <div class="p-6 border-b-2 border-surface-900">
                    <h2 class="text-2xl font-heading font-black text-surface-900 uppercase tracking-tighter">
                        TOPO<br>FORMS.
                    </h2>
                    <p class="text-xs text-surface-500 mt-2 uppercase tracking-widest font-bold">${formattedRole}</p>
                </div>
                
                <nav class="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    <ul class="space-y-1">
                        ${linksHtml}
                    </ul>
                </nav>

                <div class="p-4 border-t-2 border-surface-900">
                    <button id="logout-btn" class="w-full flex items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest text-surface-900 border-2 border-surface-900 hover:bg-surface-900 hover:text-white transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>
        `;
    }

    attachEvents(container) {
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthService.logout();
            });
        }
    }
}
