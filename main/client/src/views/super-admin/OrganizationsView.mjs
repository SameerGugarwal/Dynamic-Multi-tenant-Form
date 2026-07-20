import { Table } from '../../components/table/Table.mjs';
import { Modal } from '../../components/modal/Modal.mjs';
import { OrganizationService } from '../../modules/organizations/organization.service.mjs';
import { CenterService } from '../../modules/centers/center.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import Swal from 'sweetalert2';

export default class OrganizationsView {
    constructor(match) {
        this.match = match;
        this.orgs = [];
        this.centers = [];
        // Per-modal-session flag for the "unlockable" center checkbox state machine.
        // Reset to false each time the Edit modal opens; flips to true once the user
        // clears their selection, after which the full center list stays visible.
        this.isCenterListUnlocked = false;
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
            const selectedCenter = document.getElementById('no-center').value;

            // Centers <-> Orgs is many-to-many: a center may belong to multiple orgs,
            // so no conflict/exclusivity check is needed on assignment.
            const payload = {
                name: document.getElementById('no-name').value,
                contactEmail: document.getElementById('no-email').value,
                centers: [selectedCenter]
            };
            try {
                await OrganizationService.createOrganization(payload);
                Toast.success('Organization Created!');
                document.getElementById('new-org-form').reset();
                this.container.querySelector('#org-form-container').classList.add('hidden');
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
            <div class="animate-fade-in max-w-6xl mx-auto pt-9">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">ORGANIZATIONS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">GLOBAL TENANT REGISTRY</p>
                    </div>
                    <button id="add-tenant-btn" class="bg-brand-700 text-white hover:bg-brand-800 transition-colors px-4 py-2 font-bold  transition-colors">+ ADD TENANT</button>
                </div>
                
                <div id="org-form-container" class="hidden mb-8 bg-surface-50 border border-surface-200 rounded-xl shadow-sm p-6 shadow-sm">
                    <form id="new-org-form" class="flex gap-4 items-end">
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Org Name</label>
                            <input type="text" id="no-name" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Contact Email</label>
                            <input type="email" id="no-email" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" required>
                        </div>
                        <div class="flex-1">
                            <label class="text-xs font-bold block mb-1">Assign to Center</label>
                            <select id="no-center" class="w-full border p-2 border-surface-900 font-bold" required>
                                <option value="">Loading centers...</option>
                            </select>
                        </div>
                        <button type="submit" class="bg-brand-700 text-white hover:bg-brand-800 font-bold px-6 h-11 font-medium hover:bg-brand-800 transition-colors">CREATE ORG</button>
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
        this.container.querySelector("#table-container").innerHTML = `
            <div class="h-64 border border-surface-200 rounded-lg bg-surface-50 flex items-center justify-center">
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
                const assignedCentersIds = (org.centers || []).map(c => c._id || c.id || c).join(',');
                const centerText = centerCount > 0 ? `${centerCount} Centers` : '<span class="text-red-500 font-bold">Unassigned</span>';

                return {
                    id: org.id || org._id || 'N/A',
                    name: `<button class="view-info-btn font-bold font-medium text-brand-500 hover:text-brand-700  transition-colors" data-id="${org._id}">${org.name}</button>`,
                    center: centerText,
                    status: org.isActive !== false
                        ? '<span class="text-green-600 font-bold uppercase text-xs tracking-widest">ACTIVE</span>' 
                        : '<span class="text-red-600 font-bold uppercase text-xs tracking-widest">INACTIVE</span>',
                    actions: `
                        <button class="edit-btn text-xs font-medium tracking-wide border-b border-surface-200 hover:text-brand-500 transition-colors mr-3" data-id="${org._id}" data-name="${org.name}" data-email="${org.contactEmail || ''}" data-active="${org.isActive !== false}" data-centers="${assignedCentersIds}">MANAGE</button>
                        <button class="delete-btn text-xs font-medium tracking-wide text-red-600 border-b border-red-600 hover:text-red-800 transition-colors" data-id="${org._id}" data-name="${org.name}">DELETE</button>
                    `
                };
            });

            const table = new Table(headers, rows);
            this.container.querySelector('#table-container').innerHTML = table.render();

            // Bind Edit Modal
            this.container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    const email = e.target.dataset.email;
                    const isActive = e.target.dataset.active === 'true';
                    const assignedCentersIds = e.target.dataset.centers ? e.target.dataset.centers.split(',') : [];
                    
                    const bodyHTML = `
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold block mb-1">Org Name</label>
                                <input type="text" id="ec-name" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" value="${name}">
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Email</label>
                                <input type="email" id="ec-email" class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm" value="${email}">
                            </div>
                            <div>
                                <label class="text-xs font-bold block mb-1">Assigned Centers</label>
                                <div id="ec-centers-container" class="border border-surface-200 rounded-xl shadow-sm p-3 h-32 overflow-y-auto bg-white">
                                </div>
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

                    const editModal = new Modal('EDIT ORG', bodyHTML, async () => {
                        const selectedCenters = Array.from(document.querySelectorAll('input[name="ec-center-checkbox"]:checked')).map(cb => cb.value);

                        // Centers <-> Orgs is many-to-many, so no conflict/exclusivity check on save.
                        const payload = {
                            name: document.getElementById('ec-name').value,
                            contactEmail: document.getElementById('ec-email').value,
                            isActive: document.getElementById('ec-status').value === 'ACTIVE',
                            centers: selectedCenters
                        };
                        try {
                            await OrganizationService.updateOrganization(id, payload);
                            Toast.success('Organization Updated!');
                            this.loadData();
                        } catch(err) {
                            console.error(err);
                            Toast.error('Failed to update organization');
                        }
                    });
                    editModal.open();

                    // ---- "Unlockable" center checkbox state machine ----
                    // Reset the lock for every fresh modal session.
                    this.isCenterListUnlocked = false;

                    const containerElement = document.getElementById('ec-centers-container');

                    // Set of centers owned by OTHER orgs (used to filter in Safe Mode).
                    // Many-to-many is allowed at the data level; this hiding is purely a
                    // safety UX guard so the admin doesn't casually touch another org's centers.
                    const otherOrgCenterIds = new Set();
                    this.orgs.forEach(o => {
                        if (String(o._id || o.id) === String(id)) return; // skip the org being edited
                        (o.centers || []).forEach(c => otherOrgCenterIds.add(String(c._id || c.id || c)));
                    });

                    // Renders the checkbox list according to the current lock state.
                    // - Locked (State 1, Safe Mode): this org's centers + unassigned centers only.
                    // - Unlocked (State 3, Free Select): every center in the database.
                    const renderCenterCheckboxes = (checkedIds) => {
                        if (!containerElement) return;
                        const checkedSet = new Set((checkedIds || []).map(String));

                        const visibleCenters = this.isCenterListUnlocked
                            ? this.centers
                            : this.centers.filter(c => !otherOrgCenterIds.has(String(c._id || c.id)));

                        containerElement.innerHTML = ''; // Safely clear the targeted container

                        if (visibleCenters.length === 0) {
                            const empty = document.createElement('p');
                            empty.className = 'text-xs text-slate-400';
                            empty.textContent = 'No centers available.';
                            containerElement.appendChild(empty);
                            return;
                        }

                        visibleCenters.forEach(c => {
                            const cId = String(c._id || c.id);

                            const label = document.createElement('label');
                            label.className = 'flex items-center gap-2 cursor-pointer mb-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 transition-colors';

                            const input = document.createElement('input');
                            input.type = 'checkbox';
                            input.name = 'ec-center-checkbox';
                            input.value = cId;
                            input.className = 'w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/50';
                            if (checkedSet.has(cId)) input.checked = true;

                            const span = document.createElement('span');
                            span.className = 'text-sm text-slate-700';
                            span.textContent = c.name; // XSS-safe `.textContent` rendering

                            label.appendChild(input);
                            label.appendChild(span);
                            containerElement.appendChild(label);
                        });
                    };

                    if (containerElement) {
                        // State 1: initial render, filtered, pre-checking this org's centers.
                        renderCenterCheckboxes(assignedCentersIds);

                        // Single delegated listener drives the State 2 / State 3 transitions.
                        containerElement.addEventListener('change', (event) => {
                            if (event.target.name !== 'ec-center-checkbox') return;

                            // State 3: once unlocked, never re-filter/re-render, so checking a
                            // box in the full list can't hide the other unselected options.
                            if (this.isCenterListUnlocked) return;

                            const checkedCount = containerElement.querySelectorAll('input[name="ec-center-checkbox"]:checked').length;

                            // State 2: user cleared everything -> unlock and reveal ALL centers.
                            if (checkedCount === 0) {
                                this.isCenterListUnlocked = true;
                                renderCenterCheckboxes([]);
                            }
                        });
                    }
                });
            });

            // Bind Delete Modal
            this.container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    const name = e.target.dataset.name;
                    
                    const { value: confirmText } = await Swal.fire({
                        title: 'Are you absolutely sure?',
                        html: `Warning: This will permanently delete the Organization <b>${name}</b> and ALL Users assigned to it.<br><br>Type 'DELETE' to confirm.`,
                        icon: 'warning',
                        input: 'text',
                        inputValidator: (value) => {
                            if (value !== 'DELETE') {
                                return 'You must type DELETE to confirm!';
                            }
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Delete Organization',
                        confirmButtonColor: '#ef4444',
                        customClass: {
                            container: 'z-[9999]'
                        }
                    });

                    if (confirmText === 'DELETE') {
                        try {
                            await OrganizationService.deleteOrganization(id);
                            Toast.success('Organization and its users deleted successfully.');
                            this.loadData();
                        } catch (err) {
                            Toast.error('Failed to delete organization.');
                            console.error(err);
                        }
                    }
                });
            });

            // Bind View Info Modal
            this.container.querySelectorAll('.view-info-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    
                    // Open modal immediately with loading state
                    const infoModal = new Modal('ORG INFO', '<p class="animate-pulse-soft text-xs font-bold py-4">LOADING API DATA...</p>', null);
                    infoModal.open();
                    
                    try {
                        const res = await OrganizationService.getOrganizationInfo(id);
                        const info = res.data?.data || res.data || res;
                        const centerNames = (info.centers || []).map(c => c.name || 'Unknown Center').join(', ');
                        
                        // Overwrite modal body safely once data arrives
                        const modalBody = document.getElementById('modal-body');
                        if (modalBody) {
                            modalBody.innerHTML = `
                                <div class="mb-6">
                                    <label class="text-[10px] font-medium tracking-wide text-slate-500">TOTAL USERS</label>
                                    <div class="text-4xl font-heading font-semibold text-brand-600">${info.userCount || 0}</div>
                                </div>
                                <div>
                                    <label class="text-[10px] font-medium tracking-wide text-slate-500">ASSIGNED CENTERS</label>
                                    <div class="text-sm font-bold text-slate-800 mt-1 leading-relaxed">${centerNames || '<span class="text-red-500">None</span>'}</div>
                                </div>
                            `;
                        }
                    } catch (err) {
                        const modalBody = document.getElementById('modal-body');
                        if (modalBody) {
                            modalBody.innerHTML = '<p class="text-red-600 font-bold uppercase text-xs py-4">Failed to load info.</p>';
                        }
                    }
                });
            });

        } catch (error) {
            Toast.error('Failed to load organizations');
            this.container.querySelector('#table-container').innerHTML = `
                <div class="border border-red-500 p-8 text-center bg-red-50">
                    <p class="text-red-700 text-xs font-bold font-medium">CRITICAL ERROR: API DISCONNECTED</p>
                </div>
            `;
        }
    }
}
