import { Table } from '../../components/table/Table.mjs';

export default class MyReportsView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">SUBMISSION HISTORY</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">PAST FORMS</p>
                    </div>
                </div>
                <div id="table-container">LOADING...</div>
            </div>
        `;
        
        const headers = ['FORM ID', 'SUBMITTED ON', 'STATUS', 'ACTIONS'];
        let rows = [];
        try {
            const { submissionsService } = await import('../../modules/submissions/submission.service.mjs');
            const res = await submissionsService.fetchAll();
            rows = (res.data || []).map(s => ({ form: s.formId, date: s.createdAt, status: 'COMPLETED', actions: 'VIEW RECEIPT' }));
        } catch (e) {
            rows = [{ form: 'Error', date: '-', status: '-', actions: '-' }];
        }
        const table = new Table(headers, rows);
        this.container.querySelector('#table-container').innerHTML = table.render();
    }
}
