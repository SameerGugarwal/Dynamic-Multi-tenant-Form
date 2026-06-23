import { AuthService } from '../../modules/auth/auth.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { router } from '../../router/router.mjs';
import { ROUTES } from '../../constants/routes.mjs';

export default class ForgotPasswordView {
    async mount(container) {
        this.container = container;
        this.render();
        this.initListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-surface-50 flex items-center justify-center p-6 bg-grid-pattern">
                <div class="max-w-md w-full bg-white border-2 border-surface-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                    <div class="mb-8">
                        <div class="w-12 h-12 bg-surface-900 mb-6 flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="square" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h1 class="text-3xl font-heading font-black text-surface-900 uppercase tracking-tighter">RECOVER ACCESS</h1>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">WE WILL SEND A RECOVERY OTP TO YOUR INBOX.</p>
                    </div>

                    <form id="forgot-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">EMAIL ADDRESS</label>
                            <input type="email" id="email" required class="w-full px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors">
                        </div>

                        <button type="submit" class="w-full bg-surface-900 text-white font-black uppercase tracking-widest text-sm py-4 hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            SEND OTP
                        </button>
                    </form>
                    
                    <div class="mt-8 pt-6 border-t-2 border-surface-200 text-center">
                        <a href="${ROUTES.LOGIN}" data-navigo class="text-xs font-black uppercase tracking-widest text-surface-500 hover:text-surface-900 border-b-2 border-transparent hover:border-surface-900 transition-all pb-1">RETURN TO LOGIN</a>
                    </div>
                </div>
            </div>
        `;
    }

    initListeners() {
        this.container.querySelector('#forgot-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = this.container.querySelector('#email').value;
            
            try {
                await AuthService.requestPasswordReset(email);
                Toast.success('Recovery OTP Sent to ' + email);
                router.navigate(ROUTES.VERIFY_OTP + '?email=' + encodeURIComponent(email));
            } catch (error) {
                Toast.error('Failed to send request. Check your email.');
            }
        });
    }
}
