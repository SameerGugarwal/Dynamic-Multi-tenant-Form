import { Table } from '../../components/table/Table.mjs';
import { OrganizationService } from '../../modules/organizations/organization.service.mjs';
import { CenterService } from '../../modules/centers/center.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import http from '../../services/http.mjs';

export default class OrganizationsView {
    constructor(match) {
        this.match = match;
        this.orgs = [];
        this.centers = [];
    }

    async mount(container) {
        this.container = container;
        this.renderSkeleton();
        
        // Fetch centers for dropdowns
        try {
            const res = await CenterService.getCenters();
            const raw = res.data || res || [];
            this.centers = Array.isArray(raw) ? raw : (raw.data || []);
            
            // Populate Create form center dropdown
            const noCenterSelect = document.getElementById('no-center');
            noCenterSelect.innerHTML = this.centers.map(c => `<option value="${c._id || c.id}">${c.name}</option>`).join('');
            
            // Populate Edit form center checkboxes
            const ecCentersContainer = document.getElementById('ec-centers-container');
            ecCentersContainer.innerHTML = this.centers.map(c => `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="ec-center-checkbox" value="${c._id || c.id}" class="w-4 h-4 text-brand-600 border-2 border-surface-900 rounded-none focus:ring-brand-500">
                    <span class="text-xs font-bold uppercase tracking-widest">${c.name}</span>
                </label>
            `).join('');
            
        } catch(e) {
            console.error("Failed to load centers for dropdowns", e);
        }
        
        // Add Org Modal Toggle
        this.container.querySelector('#add-tenant-btn').addEventListener('click', () => {
            this.container.querySelector('#org-form-container').classList.toggle('hidden');
        });
        
        // Create Org Submit
        this.container.querySelector('#new-org-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('no-name').value,
                contactEmail: document.getElementById('no-email').value,
                centers: [document.getElementById('no-center').value]
            };
            try {
                await http.post('/organizations', payload);
                Toast.success('Organization Created!');
                this.loadData();
                this.container.querySelector('#org-form-container').classList.add('hidden');
            } catch(err) {
                console.error(err);
                Toast.error('Failed to create organization');
            }
        });

        // Edit Org Submit
        this.container.querySelector('#edit-org-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const orgId = document.getElementById('edit-org-id').value;
            
            // Get selected centers from checkboxes
            const selectedCenters = Array.from(document.querySelectorAll('input[name="ec-center-checkbox"]:checked')).map(cb => cb.value);
            
            const payload = {
                name: document.getElementById('ec-name').value,
                contactEmail: document.getElementById('ec-email').value,
                isActive: document.getElementById('ec-status').value === 'ACTIVE',
                centers: selectedCenters
            };
            
            try {
                // Ensure update function exists in your OrganizationService
                await http.patch(`/organizations/${orgId}`, payload);
                Toast.success('Organization Updated!');
                this.container.querySelector('#edit-modal-container').classList.add('hidden');
                this.loadData();
            } catch(e) {
                console.error(e);
                Toast.error('Failed to update organization');
            }
        });

        // Close Edit Modal
        this.container.querySelector('#close-edit-modal').addEventListener('click', () => {
            this.container.querySelector('#edit-modal-container').classList.add('hidden');
        });

        // Close Info Modal
        this.container.querySelector('#close-info-modal').addEventListener('click', () => {
            this.container.querySelector('#info-modal-container').classList.add('hidden');
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
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Assign to Center</label>
                            <select id="no-center" class="w-full border-2 p-2 border-surface-900" required>
                                <option value="">Loading centers...</option>
                            </select>
                        </div>
                        <button type="submit" class="bg-brand-500 text-white font-bold p-3 h-11">CREATE ORG</button>
                    </form>
                </div>

                <div id="table-container">
                    <div class="h-64 border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
                    </div>
                </div>

                <!-- EDIT MODAL OVERLAY -->
                <div id="edit-modal-container" class="hidden fixed inset-0 bg-surface-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div class="bg-surface-50 border-4 border-surface-900 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] overflow-y-auto">
                        <button id="close-edit-modal" class="absolute top-4 right-4 text-surface-500 hover:text-surface-900 font-bold uppercase tracking-widest text-xs">CLOSE X</button>
                        <h3 class="text-2xl font-black uppercase mb-6 border-b-2 border-surface-900 pb-2">EDIT ORGANIZATION</h3>
                        <form id="edit-org-form" class="space-y-4">
                            <input type="hidden" id="edit-org-id">
                            <div>
                                <label class="text-xs font-bold block mb-1">Org Name</label>
                                <input type="text" id="ec-name" class="w-full border-2 p-3 border-surface-900" required>
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Email</label>
                                <input type="email" id="ec-email" class="w-full border-2 p-3 border-surface-900" required>
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Assigned Centers</label>
                                <div id="ec-centers-container" class="border-2 border-surface-900 p-3 h-32 overflow-y-auto bg-white space-y-2">
                                </div>
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Status</label>
                                <select id="ec-status" class="w-full border-2 p-3 border-surface-900 font-bold" required>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <button type="submit" class="w-full bg-brand-500 text-white font-black p-4 mt-4 uppercase tracking-widest hover:bg-brand-600 transition-colors">SAVE CHANGES</button>
                        </form>
                    </div>
                </div>

                <!-- INFO MODAL OVERLAY -->
                <div id="info-modal-container" class="hidden fixed inset-0 bg-surface-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div class="bg-surface-50 border-4 border-surface-900 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                        <button id="close-info-modal" class="absolute top-4 right-4 text-surface-500 hover:text-surface-900 font-bold uppercase tracking-widest text-xs">CLOSE X</button>
                        <h3 class="text-2xl font-black uppercase mb-6 border-b-2 border-surface-900 pb-2">ORG INFO</h3>
                        <div id="info-modal-content">
                            <p class="animate-pulse-soft text-xs font-bold">LOADING...</p>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    async loadData() {
        this.container.querySelector("#table-container").innerHTML = `
            <div class="h-64 border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
            </div>
        `;
        try {
            const response = await OrganizationService.getOrganizations();
            const rawData = response.data || response || [];
            this.orgs = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['TENANT ID', 'ORG NAME', 'CENTERS', 'STATUS', 'ACTIONS'];
            
            const rows = this.orgs.map(org => {
                const centerCount = org.centers && org.centers.length ? org.centers.length : 0;
                const assignedCentersIds = (org.centers || []).map(c => c._id || c).join(',');
                const centerText = centerCount > 0 ? `${centerCount} Centers` : '<span class="text-red-500 font-bold">Unassigned</span>';

                return {
                    id: org.id || org._id || 'N/A',
                    name: `<button class="view-info-btn font-bold uppercase tracking-widest text-brand-500 hover:text-brand-700 underline transition-colors" data-id="${org._id}">${org.name}</button>`,
                    center: centerText,
                    status: org.isActive !== false
                        ? '<span class="text-green-600 font-bold uppercase text-xs tracking-widest">ACTIVE</span>' 
                        : '<span class="text-red-600 font-bold uppercase text-xs tracking-widest">INACTIVE</span>',
                    actions: `<button class="edit-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-500 transition-colors" data-id="${org._id}" data-name="${org.name}" data-email="${org.contactEmail || ''}" data-active="${org.isActive !== false}" data-centers="${assignedCentersIds}">MANAGE</button>`
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Edit Buttons
            this.container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    const email = e.target.dataset.email;
                    const isActive = e.target.dataset.active === 'true';
                    const assignedCentersIds = e.target.dataset.centers ? e.target.dataset.centers.split(',') : [];
                    
                    document.getElementById('edit-org-id').value = id;
                    document.getElementById('ec-name').value = name;
                    document.getElementById('ec-email').value = email;
                    document.getElementById('ec-status').value = isActive ? 'ACTIVE' : 'INACTIVE';
                    
                    // Multi-select assignment
                    document.querySelectorAll('input[name="ec-center-checkbox"]').forEach(cb => {
                        cb.checked = assignedCentersIds.includes(cb.value);
                    });
                    
                    this.container.querySelector('#edit-modal-container').classList.remove('hidden');
                });
            });

            // Bind View Info Buttons
            this.container.querySelectorAll('.view-info-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    const modal = this.container.querySelector('#info-modal-container');
                    const content = this.container.querySelector('#info-modal-content');
                    
                    content.innerHTML = '<p class="animate-pulse-soft text-xs font-bold">LOADING...</p>';
                    modal.classList.remove('hidden');
                    
                    try {
                        const res = await http.get(`/organizations/${id}/info`);
                        const info = res.data?.data || res.data || res;
                        
                        const centerNames = (info.centers || []).map(c => c.name || 'Unknown Center').join(', ');
                        
                        content.innerHTML = `
                            <div class="mb-4">
                                <label class="text-[10px] font-black uppercase tracking-widest text-surface-500">TOTAL USERS</label>
                                <div class="text-4xl font-heading font-black text-brand-600">${info.userCount || 0}</div>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-widest text-surface-500">ASSIGNED CENTERS</label>
                                <div class="text-sm font-bold text-surface-900 mt-1 leading-relaxed">${centerNames || '<span class="text-red-500">None</span>'}</div>
                            </div>
                        `;
                    } catch (err) {
                        content.innerHTML = '<p class="text-red-600 font-bold uppercase text-xs">Failed to load info.</p>';
                    }
                });
            });

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
