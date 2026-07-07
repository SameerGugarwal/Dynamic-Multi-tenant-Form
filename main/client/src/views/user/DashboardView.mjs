
import http from '../../services/http.mjs';

export default class DashboardView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="mb-12 border-b border-surface-200 pb-4">
                    <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">DASHBOARD</h2>
                    <p class="text-slate-500 font-bold font-medium text-xs mt-2">LIVE STATISTICS</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8" id="stats-grid">
                    LOADING...
                </div>
            </div>
        `;
        await this.loadStats();
    }

    async loadStats() {
        try {
            const res = await http.get('/dashboard/stats');
            const data = res.data || res.data?.data || { centers: 0, orgs: 0, forms: 0, submissions: 0 };
            
            this.container.querySelector('#stats-grid').innerHTML = `
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-6 shadow-sm">
                    <div class="text-[10px] font-medium tracking-wide text-slate-500 mb-2">PENDING FORMS</div>
                    <div class="text-5xl font-heading font-semibold text-brand-600">${data.pendingForms || 0}</div>
                </div>
                <div class="border border-surface-200 rounded-xl shadow-sm bg-white p-6 shadow-sm">
                    <div class="text-[10px] font-medium tracking-wide text-slate-500 mb-2">COMPLETED FORMS</div>
                    <div class="text-5xl font-heading font-semibold text-brand-600">${data.completedForms || 0}</div>
                </div>
                <div class="col-span-2 border border-surface-200 rounded-xl shadow-sm bg-surface-50 p-6 shadow-sm flex items-center justify-center">
                    <p class="text-slate-500 font-bold font-medium text-xs">MORE ANALYTICS COMING SOON</p>
                </div>
            `;
        } catch (e) {
            this.container.querySelector('#stats-grid').innerHTML = '<div class="text-red-500 font-bold">Failed to load statistics.</div>';
        }
    }
}
