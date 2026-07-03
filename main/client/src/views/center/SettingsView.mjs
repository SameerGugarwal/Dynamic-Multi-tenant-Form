import { Toast } from '../../components/toast/Toast.mjs';
import { CenterService } from '../../modules/centers/center.service.mjs';

export default class SettingsView {
    async mount(container) {
        container.innerHTML = `
            <div class="animate-fade-in max-w-4xl mx-auto pt-9 pb-32">
                <div class="flex justify-between items-end mb-8 border-b-2 border-surface-900 pb-4">
                    <div>
                        <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">CENTER SETTINGS</h2>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">GLOBAL PREFERENCES & THEME</p>
                    </div>
                </div>

                <div class="bg-white border-2 border-surface-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative p-8">
                    <div class="absolute -top-3 -left-3 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-surface-900">CONFIGURATION</div>
                    
                    <form id="settings-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">Center Name</label>
                            <input type="text" id="center-name" class="w-full border-2 border-surface-900 p-3 font-bold text-surface-900 focus:outline-none focus:border-brand-500" value="Loading...">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">Primary Contact Email</label>
                            <input type="email" id="center-email" class="w-full border-2 border-surface-900 p-3 font-bold text-surface-900 focus:outline-none focus:border-brand-500" placeholder="admin@center.com">
                        </div>

                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">Default Timezone</label>
                            <select id="center-timezone" class="w-full border-2 border-surface-900 p-3 font-bold text-surface-900 focus:outline-none focus:border-brand-500">
                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                                <option value="IST">IST (Indian Standard Time)</option>
                            </select>
                        </div>

                        <div class="pt-4 border-t-2 border-surface-200">
                            <button type="submit" id="save-btn" class="bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest text-sm px-8 py-4 border-2 border-surface-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
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
