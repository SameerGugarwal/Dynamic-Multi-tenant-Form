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
                <div class="mb-12 border-b border-surface-200 pb-4">
                    <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">USER PROFILE</h2>
                    <p class="text-slate-500 font-bold font-medium text-xs mt-2">ACCOUNT DETAILS</p>
                </div>
                
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div class="flex items-center gap-6 mb-8 border-b-2 border-surface-200 pb-8">
                        <div class="w-24 h-24 bg-brand-500 border border-surface-200 rounded-xl shadow-sm shadow-sm flex items-center justify-center text-4xl font-semibold text-white uppercase">
                            ${name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="text-3xltext-brand-900">${name}</h3>
                            <p class="text-slate-500 font-bold font-medium text-sm mt-1">${role}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label class="block text-[10px] font-medium tracking-wide text-slate-500 mb-2">EMAIL ADDRESS</label>
                            <div class="border border-surface-200 rounded-xl shadow-sm bg-surface-50 p-4 font-bold text-slate-800">${email}</div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-medium tracking-wide text-slate-500 mb-2">ACCOUNT STATUS</label>
                            <div class="border border-surface-200 rounded-xl shadow-sm bg-green-100 text-green-800 p-4 font-medium tracking-wide">ACTIVE</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
