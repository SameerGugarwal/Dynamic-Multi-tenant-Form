import { Toast } from '../../components/toast/Toast.mjs';
import { router } from '../../router/router.mjs';
import { ROUTES } from '../../constants/routes.mjs';

export default class ResetPasswordView {
    async mount(container) {
        this.container = container;
        const urlParams = new URLSearchParams(window.location.search);
        this.email = urlParams.get('email') || '';
        this.token = urlParams.get('token') || '';
        this.render();
        this.initListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-surface-50 flex items-center justify-center p-6 bg-grid-pattern">
                <div class="max-w-md w-full bg-white border-2 border-surface-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                    <div class="mb-8">
                        <h1 class="text-3xl font-heading font-black text-surface-900 uppercase tracking-tighter">NEW CREDENTIALS</h1>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">SECURE YOUR ACCOUNT</p>
                    </div>

                    <form id="reset-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">NEW PASSWORD</label>
                            <input type="password" id="password" required class="w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">CONFIRM PASSWORD</label>
                            <input type="password" id="confirm-password" required class="w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors">
                        </div>

                        <button type="submit" class="w-full bg-surface-900 text-white font-black uppercase tracking-widest text-sm py-4 hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            UPDATE KEY
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    initListeners() {
        this.container.querySelector('#reset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const pass = this.container.querySelector('#password').value;
            const confirm = this.container.querySelector('#confirm-password').value;
            
            if (pass !== confirm) {
                Toast.error('Passwords do not match.');
                return;
            }

            try {
                await AuthService.resetPassword(this.email, this.token, pass);
                Toast.success('Password updated! Please login.');
                router.navigate(ROUTES.LOGIN);
            } catch (error) {
                Toast.error('Failed to update password.');
            }
        });
    }
}
