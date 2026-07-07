import { ROUTES } from '../../constants/routes.mjs';
import { AuthService } from '../../modules/auth/auth.service.mjs';

export class Sidebar {
    constructor(role){
        this.role = role || localStorage.getItem('topo_user_role_name');
        this.menuItems = this.getMenuItems(this.role);
    }
    
    getMenuItems(role){
        switch(role){
            case 'SUPER_ADMIN':
                return [
                    { name: 'Dashboard', path: ROUTES.SUPER_ADMIN_DASHBOARD },
                    { name: 'Centers', path: ROUTES.SUPER_ADMIN_CENTERS },
                    { name: 'Organizations', path: ROUTES.SUPER_ADMIN_ORGS },
                    { name: 'Global Forms', path: ROUTES.SUPER_ADMIN_FORMS },
                    { name: 'Users', path: ROUTES.SUPER_ADMIN_USERS},
                    { name: 'Reports', path: ROUTES.SUPER_ADMIN_REPORTS }
                ];
            case 'CENTER_ADMIN':
                return [
                    {name: 'Dashboard', path: ROUTES.CENTER_DASHBOARD},
                    {name: 'Organizations', path: ROUTES.CENTER_ORGS},
                    {name: 'Forms', path: ROUTES.CENTER_FORMS},
                    {name: 'Reports', path: ROUTES.CENTER_REPORTS},
                    {name: 'Settings', path: ROUTES.CENTER_SETTINGS}
                ]
            case 'ORG_ADMIN':
                return [
                    {name: 'Dashboard', path: ROUTES.ORG_DASHBOARD},
                    {name: 'Users', path: ROUTES.ORG_USERS},
                    {name: 'Forms', path: ROUTES.ORG_FORMS},
                    {name: 'Reports', path: ROUTES.ORG_REPORTS}
                ]
            default: 
                return [
                    {name: 'Dashboard', path: ROUTES.USER_DASHBOARD},
                    {name: 'My Forms', path: ROUTES.USER_FORMS},
                    {name: 'Profile', path: ROUTES.USER_PROFILE}
                ];
        }
    }

    render(){
        const currentPath = window.location.pathname;
        
        const linksHtml = this.menuItems.map(item => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            const activeClasses = isActive
                ? 'bg-brand-50 text-brand-700 font-semibold' 
                : 'text-slate-500 hover:bg-surface-100 hover:text-slate-800 font-medium';
            
                return `
                    <li>
                        <a href="${item.path}" data-link class="flex items-center px-4 py-2.5 my-1 transition-colors text-sm rounded-lg ${activeClasses}">
                            <span class="mr-3 opacity-50">/</span>
                            <span>${item.name}</span>
                        </a>                    
                    </li>
                `;
        }).join('');

        const formattedRole = this.role ? this.role.replace('_', ' ') : 'GUEST';

        return `
            <aside class="w-64 h-screen bg-white border-r border-surface-200 flex flex-col fixed left-0 top-0 z-40 animate-fade-in shadow-sm">
                <div class="p-6 border-b border-surface-200">
                    <h2 class="text-2xltext-brand-900">
                        TopoForms
                    </h2>
                    <p class="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">${formattedRole}</p>
                </div>
                
                <nav class="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    <ul class="space-y-1">
                        ${linksHtml}
                    </ul>
                </nav>

                <div class="p-4 border-t border-surface-200">
                    <button id="logout-btn" class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-600 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-lg transition-colors">
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
