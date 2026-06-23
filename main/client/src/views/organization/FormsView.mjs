
import { Table } from '../../components/table/Table.mjs';
import http from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { FormBuilder } from '../../dynamic-form/builder/FormBuilder.mjs';

export default class FormsView {
    async mount(container) {
        this.container = container;
        this.render();
        await this.loadMasterForms();
    }

    render() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">TEMPLATE LIBRARY</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">CLONE MASTER FORMS</p>
                    </div>
                </div>
                <div id="table-container">LOADING...</div>
                
                <div id="builder-container" class="mt-12 hidden border-t-4 border-surface-900 pt-8">
                    <h3 class="text-2xl font-black uppercase mb-4">BUILDER PREVIEW</h3>
                    <div id="form-builder-mount"></div>
                </div>
            </div>
        `;
    }

    async loadMasterForms() {
        const headers = ['MASTER FORM ID', 'TITLE', 'ACTIONS'];
        try {
            const res = await http.get('/forms/master');
            const rawData = res.data || res || [];
            const data = Array.isArray(rawData) ? rawData : (rawData.data || []);
            const rows = data.map(f => ({
                id: f._id,
                title: f.title,
                actions: `<button class="clone-btn bg-brand-500 text-white px-3 py-1 font-bold text-xs" data-id="${f._id}">CLONE TO ORG</button>`
            }));
            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();
            
            this.container.querySelectorAll('.clone-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const masterId = e.target.dataset.id;
                    try {
                        await http.post('/forms/clone', { masterFormId: masterId });
                        Toast.success('Form Cloned Successfully!');
                        // Optionally open builder...
                        this.container.querySelector('#builder-container').classList.remove('hidden');
                        new FormBuilder(this.container.querySelector('#form-builder-mount'));
                    } catch (err) {
                        Toast.error('Failed to clone form');
                    }
                });
            });
        } catch (e) {
            this.container.querySelector('#table-container').innerHTML = 'Failed to load templates.';
        }
    }
}
