import { Table } from '../../components/table/Table.mjs';
import { Modal } from '../../components/modal/Modal.mjs';
import { CenterService } from '../../modules/centers/center.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class CentersView {
    constructor(match) {
        this.match = match;
        this.centers = [];
    }

    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        // Add Center Inline Form Toggle
        this.container.querySelector('#add-center-btn').addEventListener('click', () => {
            this.container.querySelector('#center-form-container').classList.toggle('hidden');
        });
        
        // Create Center Form Submit
        this.container.querySelector('#new-center-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('nc-name').value,
                contactEmail: document.getElementById('nc-email').value,
                location: document.getElementById('nc-location').value
            };
            try {
                await CenterService.createCenter(payload);
                Toast.success('Center Created!');
                document.getElementById('new-center-form').reset();
                this.loadData();
            } catch(e) {
                console.error(e);
                Toast.error('Failed to create center');
            }
        });

        await this.loadData();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">CENTERS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">GLOBAL NODE MANAGEMENT</p>
                    </div>
                    <button id="add-center-btn" class="bg-brand-700 text-white hover:bg-brand-800 transition-colors px-4 py-2 font-bold  transition-colors">+ ADD CENTER</button>
                </div>

                <div id="center-form-container" class="hidden mb-8 bg-surface-50 border border-surface-200 rounded-xl shadow-sm p-6 shadow-sm">
                    <form id="new-center-form" class="flex gap-4 items-end">
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Center Name</label>
                            <input type="text" id="nc-name" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Email</label>
                            <input type="email" id="nc-email" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Location</label>
                            <input type="text" id="nc-location" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                        </div>
                        <button type="submit" class="bg-brand-700 text-white hover:bg-brand-800 font-bold px-6 h-11 hover:bg-brand-800 transition-colors font-medium">CREATE</button>
                    </form>
                </div>

                <div id="table-container">
                    <div class="h-64 border border-surface-200 rounded-lg bg-surface-50 flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const response = await CenterService.getCenters();
            // Handle edge cases where the API might return differently shaped data
            const rawData = response.data || response || [];
            this.centers = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['ID', 'NAME', 'LOCATION', 'STATUS', 'ACTIONS'];
            
            const rows = this.centers.map(center => ({
                id: center.id || center._id || 'N/A',
                name: `<button class="view-orgs-btn font-bold font-medium text-brand-500 hover:text-brand-700 underline transition-colors" data-id="${center._id}" data-name="${center.name}">${center.name}</button>`,
                location: center.location || 'Unknown',
                status: center.isActive !== false
                    ? '<span class="text-green-600 font-bold uppercase text-xs tracking-widest">ACTIVE</span>' 
                    : '<span class="text-surface-400 font-bold uppercase text-xs tracking-widest">INACTIVE</span>',
                actions: `<button class="edit-btn text-xs font-medium tracking-wide border-b border-surface-200 hover:text-brand-500 transition-colors" data-id="${center._id}" data-name="${center.name}" data-active="${center.isActive !== false}">EDIT</button>`
            }));

            // Re-render the Table
            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Edit Modal for each row
            this.container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    const isActive = e.target.dataset.active === 'true';
                    
                    const bodyHTML = `
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold block mb-1">Center Name</label>
                                <input type="text" id="ec-name" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" value="${name}">
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Status</label>
                                <select id="ec-status" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
                                    <option value="ACTIVE" ${isActive ? 'selected' : ''}>ACTIVE</option>
                                    <option value="INACTIVE" ${!isActive ? 'selected' : ''}>INACTIVE</option>
                                </select>
                            </div>
                        </div>
                    `;

                    // Generate dynamic modal instance
                    const editModal = new Modal('EDIT CENTER', bodyHTML, async () => {
                        const payload = {
                            name: document.getElementById('ec-name').value,
                            isActive: document.getElementById('ec-status').value === 'ACTIVE'
                        };
                        try {
                            await CenterService.updateCenter(id, payload);
                            Toast.success('Center Updated!');
                            this.loadData();
                        } catch(err) {
                            console.error(err);
                            Toast.error('Failed to update center');
                        }
                    });
                    
                    editModal.open();
                });
            });

            // Bind View Orgs Modal for each row
            this.container.querySelectorAll('.view-orgs-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    
                    try {
                        const res = await http.get(`/organizations?centerId=${id}`);
                        const orgRaw = res.data || res || [];
                        const orgData = Array.isArray(orgRaw) ? orgRaw : (orgRaw.data || []);
                        
                        let orgsHTML = '';
                        if (orgData.length === 0) {
                            orgsHTML = '<p class="text-slate-500 font-bold uppercase text-xs">No organizations assigned to this center.</p>';
                        } else {
                            orgsHTML = orgData.map(org => `
                                <div class="border-b-2 border-surface-200 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                                    <div class="font-medium tracking-wide text-brand-600">${org.name}</div>
                                    <div class="text-xs font-bold text-slate-500">${org.contactEmail || 'No Email'}</div>
                                    <div class="text-[10px] mt-1 font-medium ${org.isActive !== false ? 'text-green-600' : 'text-surface-400'}">
                                        STATUS: ${org.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                                    </div>
                                </div>
                            `).join('');
                        }

                        const bodyHTML = `
                            <div class="max-h-[50vh] overflow-y-auto p-2">
                                ${orgsHTML}
                            </div>
                        `;

                        // Passing 'null' as the third param because this modal is View-Only
                        const viewModal = new Modal(`ORGS IN: ${name}`, bodyHTML, null);
                        viewModal.open();

                    } catch(err) {
                        Toast.error('Failed to load organizations.');
                    }
                });
            });

        } catch (error) {
            Toast.error('Failed to load centers');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold font-medium">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }
}
