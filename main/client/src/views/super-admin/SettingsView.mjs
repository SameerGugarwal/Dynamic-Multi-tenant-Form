
import http from '../../services/http.mjs';
import { Toast } from '../../components/toast/Toast.mjs';

export default class SettingsView {
    async mount(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="animate-fade-in max-w-6xl mx-auto">
                <div class="mb-12 border-b-2 border-surface-900 pb-4">
                    <h2 class="text-4xl font-heading font-black text-surface-900 uppercase tracking-tighter">SETTINGS & PROFILE</h2>
                </div>
                <div class="bg-white border-2 border-surface-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md">
                    <form id="profile-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest mb-1">Update Name</label>
                            <input type="text" id="prof-name" class="w-full border-2 border-surface-900 p-2" required>
                        </div>
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest mb-1">Update Email</label>
                            <input type="email" id="prof-email" class="w-full border-2 border-surface-900 p-2" required>
                        </div>
                        <button type="submit" class="w-full bg-surface-900 text-white font-bold p-3 uppercase tracking-widest">SAVE PROFILE</button>
                    </form>
                </div>
            </div>
        `;
        
        this.container.querySelector('#profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = this.container.querySelector('#prof-name').value;
            const email = this.container.querySelector('#prof-email').value;
            try {
                await http.patch('/users/me', { name, email });
                Toast.success('Profile Updated Successfully');
            } catch (err) {
                Toast.error('Failed to update profile');
            }
        });
    }
}
