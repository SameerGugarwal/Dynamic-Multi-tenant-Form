import { Table } from '../../components/table/Table.mjs';
import { FormRenderer } from '../../dynamic-form/renderer/FormRenderer.mjs';
// In a real app we'd fetch actual schemas from form.service.mjs
// We'll mock a simple schema here to demonstrate the renderer launching

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
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">MY ASSIGNMENTS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">FORMS PENDING COMPLETION</p>
                    </div>
                </div>
                
                <div id="table-container"></div>
            </div>
        `;

        // Mock Assigned Forms
        const headers = ['FORM ID', 'TITLE', 'DUE DATE', 'STATUS', 'ACTIONS'];
        this.assignedForms = [
            { id: 'FRM-100', title: 'Employee Onboarding Q3', due: '2026-07-01', status: '<span class="text-brand-600">PENDING</span>' },
            { id: 'FRM-101', title: 'Quarterly Compliance', due: '2026-06-30', status: '<span class="text-red-600">URGENT</span>' }
        ];

        const rows = this.assignedForms.map(form => ({
            id: form.id,
            title: form.title,
            due: form.due,
            status: form.status,
            actions: `<button class="start-form-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-500 transition-colors" data-id="${form.id}">START FORM</button>`
        }));

        const table = new Table(headers, rows);
        content.querySelector('#table-container').innerHTML = table.render();

        // Attach click listeners to "START FORM"
        content.querySelectorAll('.start-form-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.launchFormRenderer(e.target.dataset.id);
            });
        });
    }

    launchFormRenderer(formId) {
        const content = this.container.querySelector('#my-forms-content');
        
        // Render Header to go back
        content.innerHTML = `
            <div class="mb-6 max-w-4xl mx-auto">
                <button id="back-to-list-btn" class="text-surface-500 font-bold uppercase tracking-widest text-xs hover:text-surface-900 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    ABORT SUBMISSION
                </button>
            </div>
            <div id="renderer-mount"></div>
        `;

        content.querySelector('#back-to-list-btn').addEventListener('click', () => {
            this.activeRenderer = null;
            this.loadForms(); // Go back to table
        });

        // Generate a mock schema to demonstrate logic
        const mockSchema = {
            title: 'Employee Onboarding',
            description: 'Please complete all required fields.',
            sections: [
                {
                    id: 'sec_1',
                    title: 'Basic Info',
                    questions: [
                        { id: 'q1', type: 'text', text: 'Full Name', required: true },
                        { id: 'q2', type: 'radio', text: 'Are you a remote worker?', required: true, options: ['Yes', 'No'] },
                        { 
                            id: 'q3', 
                            type: 'text', 
                            text: 'Enter your shipping address for equipment', 
                            required: true,
                            visibilityRules: {
                                logicalOperator: 'AND',
                                rules: [{ targetQuestionId: 'q2', operator: 'equals', value: 'Yes' }]
                            }
                        }
                    ]
                }
            ]
        };

        const rendererContainer = content.querySelector('#renderer-mount');
        this.activeRenderer = new FormRenderer(rendererContainer, mockSchema);
        this.activeRenderer.mount();
    }
}
