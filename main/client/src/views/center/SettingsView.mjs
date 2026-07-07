import { Toast } from '../../components/toast/Toast.mjs';
import { CenterService } from '../../modules/centers/center.service.mjs';

export default class SettingsView {
    async mount(container) {
        container.innerHTML = `
            <div class="animate-fade-in max-w-4xl mx-auto pt-9 pb-32">
                <div class="flex justify-between items-end mb-8 border-b border-surface-200 pb-4">
                    <div>
                        <h2 class="text-4xltext-brand-900 uppercase tracking-tighter">CENTER SETTINGS</h2>
                        <p class="text-slate-500 font-bold font-medium text-xs mt-2">GLOBAL PREFERENCES & THEME</p>
                    </div>
                </div>

                <div class="bg-white border border-surface-200 rounded-xl shadow-sm shadow-sm relative p-8">
                    <div class="absolute -top-3 -left-3 bg-brand-700 text-white hover:bg-brand-800 text-[10px] font-medium tracking-wide px-2 py-1 border border-surface-200 rounded-xl shadow-sm">CONFIGURATION</div>
                    
                    <form id="settings-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-medium tracking-wide text-slate-800 mb-2">Center Name</label>
                            <input type="text" id="center-name" class="w-full border border-surface-200 rounded-xl shadow-sm p-3 font-bold text-slate-800 focus:outline-none focus:border-brand-500" value="Loading...">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-medium tracking-wide text-slate-800 mb-2">Primary Contact Email</label>
                            <input type="email" id="center-email" class="w-full border border-surface-200 rounded-xl shadow-sm p-3 font-bold text-slate-800 focus:outline-none focus:border-brand-500" placeholder="admin@center.com">
                        </div>

                        <div>
                            <label class="block text-xs font-medium tracking-wide text-slate-800 mb-2">Default Timezone</label>
                            <select id="center-timezone" class="w-full border border-surface-200 rounded-xl shadow-sm p-3 font-bold text-slate-800 focus:outline-none focus:border-brand-500">
                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                                <option value="IST">IST (Indian Standard Time)</option>
                            </select>
                        </div>

                        <div class="pt-4 border-t-2 border-surface-200">
                            <button type="submit" id="save-btn" class="bg-brand-500 hover:bg-brand-700 text-white hover:bg-brand-800 font-medium tracking-wide text-sm px-8 py-4 border border-surface-200 rounded-xl shadow-sm shadow-sm hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                                SAVE PREFERENCES
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const form = container.querySelector('#settings-form');
        const nameInput = container.querySelector('#center-name');
        const emailInput = container.querySelector('#center-email');
        const timezoneSelect = container.querySelector('#center-timezone');
        const saveBtn = container.querySelector('#save-btn');

        try {
            const res = await CenterService.getSettings();
            const center = res.data || res;
            if (center) {
                nameInput.value = center.name || '';
                emailInput.value = center.contactEmail || '';
                if (center.defaultTimezone) {
                    timezoneSelect.value = center.defaultTimezone;
                }
            }
        } catch (error) {
            Toast.error('Failed to load center settings');
            nameInput.value = '';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalText = saveBtn.innerText;
            saveBtn.innerText = 'SAVING...';
            saveBtn.disabled = true;

            try {
                await CenterService.updateSettings({
                    name: nameInput.value,
                    contactEmail: emailInput.value,
                    defaultTimezone: timezoneSelect.value
                });
                Toast.success('Settings saved successfully!');
            } catch (error) {
                Toast.error('Failed to save settings');
            } finally {
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
            }
        });
    }
}
