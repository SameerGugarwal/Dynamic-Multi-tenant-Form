import { Table } from '../../components/table/Table.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { FormService } from '../../modules/forms/form.service.mjs';
import { ReportService } from '../../modules/reports/report.service.mjs';
import { PdfService } from '../../modules/reports/pdf.service.mjs';
import { ExcelService } from '../../modules/reports/excel.service.mjs';

export default class ReportsView {
    constructor() {
        this.forms = [];
        this.selectedFormId = null;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9 pb-32">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">ORGANIZATION REPORTS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">ANALYTICS & SUBMISSION EXPORTS</p>
                    </div>
                </div>

                <!-- Form Selector -->
                <div class="bg-white border border-surface-200 rounded-xl shadow-sm p-8 mb-8 shadow-sm relative">
                    <div class="absolute -top-3 -left-3 bg-brand-700 text-white hover:bg-brand-800 text-[10px] font-medium tracking-wide px-2 py-1 border border-surface-200 rounded-xl shadow-sm">FILTER</div>
                    <label class="block text-xs font-medium tracking-wide text-slate-800 mb-2">SELECT A LOCAL FORM TO ANALYZE</label>
                    <select id="form-selector" class="w-full border border-surface-200 rounded-xl shadow-sm p-3 font-bold text-slate-800 focus:outline-none focus:border-brand-500">
                        <option value="">-- Select Form --</option>
                    </select>
                </div>

                <!-- Submissions Table -->
                <div id="submissions-table-container"></div>
            </div>
        `;

        await this.loadForms();
        this.bindEvents();
    }

    async loadForms() {
        try {
            const res = await FormService.getOrgForms();
            const raw = res.data || res || [];
            this.forms = Array.isArray(raw) ? raw : (raw.data || []);
            
            const selector = this.container.querySelector('#form-selector');
            this.forms.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f._id;
                opt.textContent = `${f.title} (${f.status})`;
                selector.appendChild(opt);
            });
        } catch (err) {
            Toast.error('Failed to load local forms');
        }
    }

    bindEvents() {
        this.container.querySelector('#form-selector').addEventListener('change', async (e) => {
            this.selectedFormId = e.target.value;
            if (!this.selectedFormId) {
                this.container.querySelector('#submissions-table-container').innerHTML = '';
                return;
            }
            await this.loadSubmissions();
        });
    }

    async loadSubmissions() {
        const tableContainer = this.container.querySelector('#submissions-table-container');
        tableContainer.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold tracking-widest text-xs animate-pulse-soft">LOADING DATA...</div>';

        try {
            const res = await ReportService.getSubmissionsByForm(this.selectedFormId);
            const data = res.data || res;
            const submissions = Array.isArray(data) ? data : (data.list || data.data || []);

            if (submissions.length === 0) {
                tableContainer.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold font-medium text-xs border border-surface-200 rounded-lg">NO SUBMISSIONS FOUND FOR THIS FORM.</div>';
                return;
            }

            const headers = ['ID', 'DATE', 'STATUS', 'EXPORTS'];
            const rows = submissions.map(sub => ({
                id: `<span class="text-xs font-bold text-slate-500">${sub._id.slice(-6).toUpperCase()}</span>`,
                date: `<span class="text-xs font-bold text-slate-800">${new Date(sub.createdAt).toLocaleDateString()}</span>`,
                status: `<span class="text-[10px] font-medium tracking-wide px-2 py-1 border border-surface-200 rounded-xl shadow-sm ${sub.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${sub.status || 'DRAFT'}</span>`,
                exports: `
                    <div class="flex gap-4">
                        <button class="download-pdf-btn text-xs font-medium tracking-wide border-b border-surface-200 hover:text-red-600 transition-colors" data-id="${sub._id}">PDF</button>
                        <button class="download-excel-btn text-xs font-medium tracking-wide border-b border-surface-200 hover:text-green-600 transition-colors" data-id="${sub._id}">EXCEL</button>
                    </div>
                `
            }));

            const table = new Table(headers, rows);
            tableContainer.innerHTML = table.render();

            this.bindDownloadEvents();
        } catch (err) {
            tableContainer.innerHTML = '<div class="p-8 text-center text-red-500 font-bold font-medium text-xs border border-surface-200 rounded-lg">FAILED TO LOAD SUBMISSIONS.</div>';
        }
    }

    bindDownloadEvents() {
        this.container.querySelectorAll('.download-pdf-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                try {
                    Toast.success('Generating PDF...');
                    await PdfService.downloadReport(e.target.dataset.id);
                } catch (err) {
                    Toast.error('Failed to download PDF');
                }
            });
        });

        this.container.querySelectorAll('.download-excel-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                try {
                    Toast.success('Generating Excel...');
                    await ExcelService.downloadReport(e.target.dataset.id);
                } catch (err) {
                    Toast.error('Failed to download Excel');
                }
            });
        });
    }
}
