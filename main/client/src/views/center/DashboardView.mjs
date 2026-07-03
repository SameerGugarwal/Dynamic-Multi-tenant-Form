import http from '../../services/http.mjs';

export default class DashboardView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="mb-12 border-b-2 border-surface-900 pb-4">
                    <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">DASHBOARD</h2>
                    <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">CENTER STATISTICS</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8" id="stats-grid">
                    LOADING...
                </div>
            </div>
        `;
        await this.loadStats();
    }

    async loadStats() {
        try {
            const res = await http.get('/dashboard/stats');
            console.log("Dashboard Stats Response:", res);
            const data = res.data || res.data?.data || { orgs: 0, forms: 0, submissions: 0 };
            console.log("Parsed Data:", data);
            
            this.container.querySelector('#stats-grid').innerHTML = `
                <div class="border-2 border-surface-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-2">ORGANIZATIONS</div>
                    <div class="text-5xl font-heading font-black text-brand-600">${data.orgs || 0}</div>
                </div>
                <div class="border-2 border-surface-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-2">AVAILABLE TEMPLATES</div>
                    <div class="text-5xl font-heading font-black text-brand-600">${data.forms || 0}</div>
                </div>
                <div class="border-2 border-surface-900 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div class="text-[10px] font-black uppercase tracking-widest text-surface-500 mb-2">SUBMISSIONS</div>
                    <div class="text-5xl font-heading font-black text-red-600">${data.submissions || 0}</div>
                </div>
            `;
        } catch (e) {
            this.container.querySelector('#stats-grid').innerHTML = '<div class="text-red-500 font-bold">Failed to load statistics.</div>';
        }
    }
}
