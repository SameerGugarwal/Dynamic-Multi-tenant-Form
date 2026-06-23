import { Table } from '../../components/table/Table.mjs';

export default class ReportsView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">DATA EXPORT</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">ANALYTICS & REPORTS</p>
                    </div>
                </div>
                <div id="table-container">LOADING...</div>
            </div>
        `;
        
        const headers = ['REPORT ID', 'TYPE', 'DATE GENERATED', 'ACTIONS'];
        let rows = [];
        try {
            const { ReportService } = await import('../../modules/reports/report.service.mjs');
            const res = await ReportService.fetchAll();
            rows = (res.data || []).map(r => ({
                id: r._id, type: r.type, date: r.createdAt, actions: 'DOWNLOAD CSV'
            }));
        } catch (e) {
            rows = [{ id: '-', type: 'Error loading', date: '-', actions: '-' }];
        }
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
