import { Table } from '../../components/table/Table.mjs';
import { OrganizationService } from '../../modules/organizations/organization.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class OrganizationsView {
    constructor(match) {
        this.match = match;
        this.orgs = [];
    }

    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        this.container.querySelector('#add-tenant-btn').addEventListener('click', () => {
            this.container.querySelector('#org-form-container').classList.toggle('hidden');
        });
        
        this.container.querySelector('#new-org-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('no-name').value,
                contactEmail: document.getElementById('no-email').value,
                centerId: '6a350dcf89a69b19954db96e' // Mocked center ID for demo
            };
            try {
                await http.post('/organizations', payload);
                Toast.success('Organization Created!');
                this.loadData();
            } catch(err) {
                console.error(err);
                Toast.error('Failed to create organization');
            }
        });
        
        await this.loadData();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">ORGANIZATIONS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">GLOBAL TENANT REGISTRY</p>
                    </div>
                    <button id="add-tenant-btn" class="bg-surface-900 text-white px-4 py-2 font-bold">+ ADD TENANT</button>
                </div>
                
                <div id="org-form-container" class="hidden mb-8 bg-surface-50 border-2 border-surface-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <form id="new-org-form" class="flex gap-4 items-end">
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Org Name</label><input type="text" id="no-name" class="w-full border-2 p-2 border-surface-900" required></div>
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Contact Email</label><input type="email" id="no-email" class="w-full border-2 p-2 border-surface-900" required></div>
                        <button type="submit" class="bg-brand-500 text-white font-bold p-3 h-11">CREATE ORG</button>
                    </form>
                </div>
                <div id="table-container">
                    <div class="h-64 border-2 border-surface-200 bg-surface-50 animate-pulse-soft flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs">LOADING DATA...</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        this.container.querySelector("#table-container").innerHTML = "LOADING...";
        try {
            const response = await OrganizationService.getOrganizations();
            const rawData = response.data || response || [];
            this.orgs = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['TENANT ID', 'ORG NAME', 'CENTER', 'STATUS', 'ACTIONS'];
            
            const rows = this.orgs.map(org => ({
                id: org.id || org._id || 'N/A',
                name: org.name,
                center: org.center || org.centerId || 'Unassigned',
                status: org.status || '<span class="text-green-600">ACTIVE</span>',
                actions: '<button class="text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-500 transition-colors">MANAGE</button>'
            }));

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

        } catch (error) {
            Toast.error('Failed to load organizations');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }
}
