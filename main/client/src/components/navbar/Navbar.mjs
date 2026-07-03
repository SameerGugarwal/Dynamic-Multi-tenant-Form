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
            contextBadge = `<span class="ml-4 px-2 py-1 bg-surface-100 border-2 border-surface-900 text-[10px] font-black uppercase tracking-widest text-brand-500">${centerName}</span>`;
        } else if ((role === 'ORG_ADMIN' || role === 'USER') && orgName) {
            contextBadge = `<span class="ml-4 px-2 py-1 bg-surface-100 border-2 border-surface-900 text-[10px] font-black uppercase tracking-widest text-brand-500">${orgName}</span>`;
        }

        return `
            <header class="h-16 bg-white border-b-2 border-surface-900 flex items-center justify-between px-8 w-full z-40">  
                <div class="flex items-center gap-3">
                    ${contextBadge}
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs font-bold text-surface-500 uppercase tracking-widest">
                    ${this.userName}
                    </span>
                    <div id ="profile-avatar" class="w-9 h-9 border-2 border-surface-900 bg-surface-900 text-white flex items-center justify-center font-heading font-black text-sm cursor-pointer hover:bg-surface-700 transition-colors">
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