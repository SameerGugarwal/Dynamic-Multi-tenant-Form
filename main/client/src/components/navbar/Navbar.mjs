import { TokenService } from '../../services/token.service.mjs';

export class Navbar {
    constructor(){
        this.userName = localStorage.getItem('topo_user_name') || 'Guest';
    }

    render(){
        const initial = this.userName.charAt(0).toUpperCase();
        const role = TokenService.getUserRole();
        const centerName = localStorage.getItem('topo_center_name');
        const orgName = localStorage.getItem('topo_org_name');

        let contextBadge = '';
        if (role === 'CENTER_ADMIN' && centerName) {
            contextBadge = `<span class="ml-4 px-2 py-1 bg-surface-100 border border-surface-200 text-xs font-medium rounded-md text-brand-700">${centerName}</span>`;
        } else if ((role === 'ORG_ADMIN' || role === 'USER') && orgName) {
            contextBadge = `<span class="ml-4 px-2 py-1 bg-surface-100 border border-surface-200 text-xs font-medium rounded-md text-brand-700">${orgName}</span>`;
        }

        return `
            <header class="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-8 w-full z-40">  
                <div class="flex items-center gap-3">
                    ${contextBadge}
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-slate-600">
                    ${this.userName}
                    </span>
                    <div id ="profile-avatar" class="w-9 h-9 bg-brand-700 text-white rounded-full flex items-center justify-center font-heading font-semibold text-sm cursor-pointer hover:bg-brand-800 transition-colors shadow-sm">
                        ${initial}
                    </div>
                </div>
            </header>
        `;
    }
    mount(container){
        container.innerHTML = this.render();
    }
}