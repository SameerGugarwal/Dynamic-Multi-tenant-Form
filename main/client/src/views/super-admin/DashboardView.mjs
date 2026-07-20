import { http } from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { router } from '../../router/router.mjs';
import { ROUTES } from '../../constants/routes.mjs';

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
                <div class="mb-12 border-b border-surface-200 pb-4">
                    <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">
                        DASHBOARD
                    </h2>
                    <p class="text-slate-500 font-bold font-medium text-xs mt-2">
                        LIVE STATISTICS
                    </p>
                </div>
                <!-- Metrics Grid Skeleton (The gray pulsing boxes) -->  
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8" id="stats-grid">   
                    <div class="h-32 bg-surface-100 border border-surface-200 rounded-lg animate-pulse"></div>
                    <div class="h-32 bg-surface-100 border border-surface-200 rounded-lg animate-pulse"></div>       
                    <div class="h-32 bg-surface-100 border border-surface-200 rounded-lg animate-pulse"></div>      
                    <div class="h-32 bg-surface-100 border border-surface-200 rounded-lg animate-pulse"></div>     
                </div>

                <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Placeholder for future charts or activity logs -->  
                    <div class="h-64 border border-surface-200 rounded-xl shadow-sm bg-white p-6">
                        <h2 class="text-xltext-brand-900 mb-4">
                            Recent Activity
                        </h2>  
                
                        <div class="flex items-center justify-center h-40 text-slate-400 font-medium text-sm">         
                            No Recent Activity Detected                                         
                        </div>  
                    </div>
                    <div class="h-64 border border-surface-200 bg-surface-50 p-6 rounded-xl shadow-sm">
                        <h2 class="text-xl font-heading font-semibold text-brand-700 mb-4">
                            System Health
                        </h2>

                        <div class="flex items-center justify-center h-40 text-brand-600 font-medium text-sm">         
                            All Systems Operational                                      
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
            ${this.createMetricCard('Centers', stats.centers || 0, 'bg-white', 'text-slate-800', ROUTES.SUPER_ADMIN_CENTERS)}
            ${this.createMetricCard('Organizations', stats.orgs || 0, 'bg-surface-50', 'text-brand-700', ROUTES.SUPER_ADMIN_ORGS)}
            ${this.createMetricCard('Master Forms', stats.forms || 0, 'bg-white', 'text-slate-800', ROUTES.SUPER_ADMIN_FORMS)}
            ${this.createMetricCard('Submissions', stats.submissions || 0, 'bg-brand-700', 'text-white', ROUTES.SUPER_ADMIN_REPORTS)}
        `;

        // Attach routing event listeners
        const cards = grid.querySelectorAll('.metric-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const route = e.currentTarget.dataset.route;
                if (route) {
                    router.navigate(route);
                }
            });
        });
    }
    createMetricCard(title, value, bgClass, textClass, routePath){
        return`
            <div data-route="${routePath}" class="metric-card ${bgClass} border border-surface-200 rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                <p class="${textClass} text-sm font-medium opacity-80 mb-2">
                    ${title}
                </p>
                <h3 class="${textClass} text-5xl font-heading font-semibold tracking-tight">
                    ${value}
                </h3>
            </div>
        `;
    }

}