import { Table } from '../../components/table/Table.mjs';
import { FormRenderer } from '../../dynamic-form/renderer/FormRenderer.mjs';
import { Toast } from '../../components/toast/Toast.mjs';

export default class MyFormsView {
    constructor(match) {
        this.match = match;
        this.assignedForms = [];
        this.activeRenderer = null;
    }

    async mount(container) {
        this.container = container;
        this.container.innerHTML = this.renderBase();
        
        await this.loadForms();
    }

    renderBase() {
        return `
            <div id="my-forms-content" class="w-full">
                <!-- Data Table or Form Renderer will inject here -->
            </div>
        `;
    }

    async loadForms() {
        const content = this.container.querySelector('#my-forms-content');
        content.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">MY ASSIGNMENTS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">FORMS PENDING COMPLETION</p>
                    </div>
                </div>
                
                <div id="table-container"></div>
            </div>
        `;

        try {
            const { FormService } = await import('../../modules/forms/form.service.mjs');
            const res = await FormService.getOrgForms();
            const rawForms = res.data || res || [];
            const allAssigned = Array.isArray(rawForms) ? rawForms : (rawForms.data || []);
            
            // Users should only see forms that have been officially PUBLISHED by the Org Admin
            this.assignedForms = allAssigned.filter(f => f.status === 'PUBLISHED');
            
            const headers = ['FORM ID', 'TITLE', 'STATUS', 'ACTIONS'];
            
            if (this.assignedForms.length === 0) {
                content.querySelector('#table-container').innerHTML = '<div class="p-8 text-center text-slate-500 font-bold font-medium text-xs border border-surface-200 rounded-lg">NO FORMS ASSIGNED TO YOU AT THIS TIME.</div>';
                return;
            }

            const rows = this.assignedForms.map(form => ({
                id: `<span class="text-xs font-bold text-slate-500">${form._id.slice(-6).toUpperCase()}</span>`,
                title: `<span class="font-bold text-slate-800 font-medium">${form.title}</span>`,
                status: `<span class="text-xs font-medium tracking-wide px-2 py-1 border border-surface-200 rounded-xl shadow-sm ${form.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${form.isCompleted ? 'COMPLETED' : 'PENDING'}</span>`,
                actions: `<button class="start-form-btn text-xs font-medium tracking-wide border-b border-surface-200 ${form.isCompleted ? 'text-surface-400 cursor-not-allowed opacity-50' : 'hover:text-brand-500 transition-colors'}" data-id="${form._id}" data-completed="${form.isCompleted ? 'true' : 'false'}">START FORM</button>`
            }));

            const table = new Table(headers, rows);
            content.querySelector('#table-container').innerHTML = table.render();

            // Attach click listeners to "START FORM"
            content.querySelectorAll('.start-form-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (e.target.dataset.completed === 'true') {
                        Toast.error('You have already completed this form.');
                        return;
                    }
                    this.launchFormRenderer(e.target.dataset.id);
                });
            });
        } catch (error) {
            console.error(error);
            content.querySelector('#table-container').innerHTML = '<div class="p-8 text-center text-red-500 font-bold font-medium text-xs border border-surface-200 rounded-lg">FAILED TO LOAD FORMS.</div>';
        }
    }

    async launchFormRenderer(formId) {
        const content = this.container.querySelector('#my-forms-content');
        
        // Render Header to go back
        content.innerHTML = `
            <div class="mb-4 max-w-4xl mx-auto flex justify-end pt-8">
                <button id="back-to-list-btn" class="w-12 h-12 flex items-center justify-center bg-red-500 text-white border border-surface-200 rounded-xl shadow-sm shadow-sm hover:translate-y-1 hover:shadow-none transition-all font-semibold text-xl" title="Close Form">
                    X
                </button>
            </div>
            <div id="renderer-mount">
                <div class="p-8 text-center text-slate-500 font-bold font-medium text-xs animate-pulse-soft">LOADING FORM...</div>
            </div>
        `;

        content.querySelector('#back-to-list-btn').addEventListener('click', () => {
            this.activeRenderer = null;
            this.loadForms(); // Go back to table
        });

        try {
            const { FormService } = await import('../../modules/forms/form.service.mjs');
            const res = await FormService.getFormById(formId);
            const actualForm = res.data || res;
            
            const rendererContainer = content.querySelector('#renderer-mount');
            rendererContainer.innerHTML = '';
            
            this.activeRenderer = new FormRenderer(rendererContainer, actualForm);
            this.activeRenderer.mount();
            
            // Listen for successful submission
            rendererContainer.addEventListener('submission-complete', () => {
                this.activeRenderer = null;
                this.loadForms(); // Reloads table and updates dashboard counts automatically
            });
        } catch (e) {
            content.querySelector('#renderer-mount').innerHTML = '<div class="p-8 text-center text-red-500 font-bold font-medium text-xs border border-surface-200 rounded-lg">FAILED TO LOAD FORM DETAILS.</div>';
        }
    }
}
