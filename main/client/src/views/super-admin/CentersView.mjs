import { Table } from '../../components/table/Table.mjs';
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
        
        // Add Center Modal Toggle
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
                this.loadData();
            } catch(e) {
                console.error(e);
                Toast.error('Failed to create center');
            }
        });

        // Edit Center Form Submit
        this.container.querySelector('#edit-center-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const centerId = document.getElementById('edit-center-id').value;
            const payload = {
                name: document.getElementById('ec-name').value,
                isActive: document.getElementById('ec-status').value === 'ACTIVE'
            };
            try {
                await CenterService.updateCenter(centerId, payload);
                Toast.success('Center Updated!');
                this.container.querySelector('#edit-modal-container').classList.add('hidden');
                this.loadData();
            } catch(e) {
                console.error(e);
                Toast.error('Failed to update center');
            }
        });

        // Close Edit Modal
        this.container.querySelector('#close-edit-modal').addEventListener('click', () => {
            this.container.querySelector('#edit-modal-container').classList.add('hidden');
        });
        
        await this.loadData();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">CENTERS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">GLOBAL NODE MANAGEMENT</p>
                    </div>
                    <button id="add-center-btn" class="bg-surface-900 text-white px-4 py-2 font-bold">+ ADD CENTER</button>
                </div>
                
                <div id="center-form-container" class="hidden mb-8 bg-surface-50 border-2 border-surface-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <form id="new-center-form" class="flex gap-4 items-end">
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Center Name</label><input type="text" id="nc-name" class="w-full border-2 p-2 border-surface-900" required></div>
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Email</label><input type="email" id="nc-email" class="w-full border-2 p-2 border-surface-900" required></div>
                        <div class="flex-1"><label class="text-xs font-bold block mb-1">Location</label><input type="text" id="nc-location" class="w-full border-2 p-2 border-surface-900" required></div>
                        <button type="submit" class="bg-brand-500 text-white font-bold p-3 h-11">CREATE CENTER</button>
                    </form>
                </div>

                <div id="table-container">
                    <div class="h-64 border-2 border-surface-200 bg-surface-50 flex items-center justify-center">
                        <span class="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse-soft">LOADING DATA...</span>
                    </div>
                </div>

                <!-- EDIT MODAL OVERLAY -->
                <div id="edit-modal-container" class="hidden fixed inset-0 bg-surface-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div class="bg-surface-50 border-4 border-surface-900 p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                        <button id="close-edit-modal" class="absolute top-4 right-4 text-surface-500 hover:text-surface-900 font-bold uppercase tracking-widest text-xs">CLOSE X</button>
                        <h3 class="text-2xl font-black uppercase mb-6 border-b-2 border-surface-900 pb-2">EDIT CENTER</h3>
                        <form id="edit-center-form" class="space-y-4">
                            <input type="hidden" id="edit-center-id">
                            <div>
                                <label class="text-xs font-bold block mb-1">Center Name</label>
                                <input type="text" id="ec-name" class="w-full border-2 p-3 border-surface-900" required>
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

            </div>
        `;
    }

    async loadData() {
        try {
            const response = await CenterService.getCenters();
            const rawData = response.data || response || [];
            this.centers = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const headers = ['ID', 'NAME', 'LOCATION', 'STATUS', 'ACTIONS'];
            
            const rows = this.centers.map(center => ({
                id: center.id || center._id || 'N/A',
                name: center.name,
                location: center.location || 'Unknown',
                status: center.isActive !== false
                    ? '<span class="text-green-600 font-bold uppercase text-xs tracking-widest">ACTIVE</span>' 
                    : '<span class="text-red-600 font-bold uppercase text-xs tracking-widest">INACTIVE</span>',
                actions: `<button class="edit-btn text-xs font-black uppercase tracking-widest border-b-2 border-surface-900 hover:text-brand-500 transition-colors" data-id="${center._id}" data-name="${center.name}" data-active="${center.isActive !== false}">EDIT</button>`
            }));

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Edit Buttons
            this.container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    const isActive = e.target.dataset.active === 'true';
                    
                    document.getElementById('edit-center-id').value = id;
                    document.getElementById('ec-name').value = name;
                    document.getElementById('ec-status').value = isActive ? 'ACTIVE' : 'INACTIVE';
                    
                    this.container.querySelector('#edit-modal-container').classList.remove('hidden');
                });
            });

        } catch (error) {
            Toast.error('Failed to load centers');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border-2 border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold uppercase tracking-widest">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }
}
