import { http } from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';

export default class DashboardView {
    async mount(container) {
        // saving the container reference 
        this.container = container;
        // rendering the UI 
        this.container.innerHTML = this.renderSkeleton();
        // fetch data n update UI
        await this.loadStats();
    }

    renderSkeleton() {
        return `
            <div class="animate-fade-in w-full max-w-7xl mx-auto mt-9">
                <div class="mb-12 border-b-2 border-surface-900 pb-4">
                    <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">
                        DASHBOARD
                    </h2>
                    <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">
                        LIVE STATISTICS
                    </p>
                </div>
                <!-- Metrics Grid Skeleton (The gray pulsing boxes) -->  
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8" id="stats-grid">   
                    <div class="h-32 bg-surface-100 border-2 border-surface-200 animate-pulse"></div>
                    <div class="h-32 bg-surface-100 border-2 border-surface-200 animate-pulse"></div>       
                    <div class="h-32 bg-surface-100 border-2 border-surface-200 animate-pulse"></div>      
                    <div class="h-32 bg-surface-100 border-2 border-surface-200 animate-pulse"></div>     
                </div>

                <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Placeholder for future charts or activity logs -->  
                    <div class="h-64 border-2 border-surface-900 bg-white p-6 shadow-[8px_8px_0px_#09090b] ">
                        <h2 class="text-xl font-heading font-black uppercase tracking-widest mb-4">
                            Recent Activity
                        </h2>  
                
                        <div class="flex items-center justify-center h-40 text-surface-400 font-bold text-xs uppercase tracking-widest">         
                            No Recent Activity Detected                                         
                        </div>  
                    </div>
                    <div class="h-64 border-2 border-brand-900 bg-brand-50 p-6 shadow-[8px_8px_0px_#1e1b4b]">
                        <h2 class="text-xl font-heading font-black uppercase tracking-widest text-brand-900 mb-4">
                            System health
                        </h2>

                        <div class="flex items-center justify-center h-40 text-brand-400 font-bold text-xs uppercase tracking-widest">         
                            ALL SYSTEMS OPERATIONAL                                      
                        </div> 
                    </div>
                </div>
            </div>
        `;
    }

    async loadStats() {
        try{
            //Api call
            const res = await http.get('/dashboard/stats');
            //your robust data parsing logic
            const data = (res.data) ? res.data : (res || {centers: 0, orgs: 0, forms: 0, submissions: 0});
            this.renderMetrics(data);
        }catch(error){
            // alwayes TOAST popup 
            Toast.error('Failed to load dashboard statistics. ');
            // render 0s so the design stays intact
            this.renderMetrics({
                Centers: 0, 
                orgs: 0, 
                forms: 0,
                submissions: 0
            });
        }
    }
    renderMetrics(stats) {
        const grid = this.container.querySelector('#stats-grid');
        // injecting the interactive hover cards
        grid.innerHTML = `
            ${this.createMetricCard('CENTERS',stats.centers || 0, 'bg-white', 'text-surface- 900')}
            ${this.createMetricCard('ORGANIZATIONS', stats.orgs || 0, 'bg-surface-900', 'text-white')}
            ${this.createMetricCard('MASTER FORMS', stats.forms || 0, 'bg-white', 'text-surface-900')}
            ${this.createMetricCard('SUBMISSIONS', stats.submissions || 0, 'bg-brand-600', 'text-white border-brand-900')}
        `;
    }
    createMetricCard( title, value, bgClass, textClass){
        return`
            <div class="${bgClass} border-2 border-surface-900 p-6 shadow-[4px_4px_0px_#09090b] hover:shadow-[8px_8px_0px_#09090b] hover:-translate-y-1 transition-all cursor-default">
                <p class="${textClass} text-xs font-black uppercase tracking-widest opacity-80 mb-2">
                    ${title}
                </p>
                <h3 class="${textClass} text-5xl font-heading font-black tracking-tighter ">
                    ${value}
                </h3>
            </div>
        `;
    }

}