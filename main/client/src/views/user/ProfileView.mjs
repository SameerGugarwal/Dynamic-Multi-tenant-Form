import { TokenService } from '../../services/token.service.mjs';

export default class ProfileView {
    mount(container) {
        this.container = container;
        this.render();
    }

    render() {
        let user = null;
        try {
            const stored = localStorage.getItem('topo_user_profile');
            if (stored) user = JSON.parse(stored);
        } catch(e) {}

        const tokenPayload = TokenService.decodeToken() || {};
        const email = user?.email || tokenPayload?.email || 'N/A';
        const role = user?.role?.name || tokenPayload?.role?.name || tokenPayload?.role || 'User';
        const name = user?.name || 'User';

        this.container.innerHTML = `
            <div class="animate-fade-in max-w-4xl mx-auto pt-9 pb-16">
                <div class="mb-12 border-b-2 border-surface-900 pb-4">
                    <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">USER PROFILE</h2>
                    <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">ACCOUNT DETAILS</p>
                </div>
                
                <div class="border-2 border-surface-900 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div class="flex items-center gap-6 mb-8 border-b-2 border-surface-200 pb-8">
                        <div class="w-24 h-24 bg-brand-500 border-2 border-surface-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-4xl font-black text-white uppercase">
                            ${name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="text-3xl font-black uppercase tracking-tighter text-surface-900">${name}</h3>
                            <p class="text-surface-500 font-bold uppercase tracking-widest text-sm mt-1">${role}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-surface-500 mb-2">EMAIL ADDRESS</label>
                            <div class="border-2 border-surface-900 bg-surface-50 p-4 font-bold text-surface-900">${email}</div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black uppercase tracking-widest text-surface-500 mb-2">ACCOUNT STATUS</label>
                            <div class="border-2 border-surface-900 bg-green-100 text-green-800 p-4 font-black uppercase tracking-widest">ACTIVE</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
