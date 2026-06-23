import { Toast } from '../../components/toast/Toast.mjs';
import { router } from '../../router/router.mjs';
import { ROUTES } from '../../constants/routes.mjs';

export default class VerifyOtpView {
    async mount(container) {
        this.container = container;
        const urlParams = new URLSearchParams(window.location.search);
        this.email = urlParams.get('email') || '';
        this.render();
        this.initListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="min-h-screen bg-surface-50 flex items-center justify-center p-6 bg-grid-pattern">
                <div class="max-w-md w-full bg-white border-2 border-surface-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                    <div class="mb-8">
                        <h1 class="text-3xl font-heading font-black text-surface-900 uppercase tracking-tighter">VERIFY IDENTITY</h1>
                        <p class="text-surface-500 font-bold uppercase tracking-widest text-xs mt-2">ENTER THE 6-DIGIT CODE SENT TO ${this.email}</p>
                    </div>

                    <form id="otp-form" class="space-y-6">
                        <div>
                            <label class="block text-xs font-black uppercase tracking-widest text-surface-900 mb-2">SECURE OTP</label>
                            <input type="text" id="otp" required maxlength="6" pattern="[0-9]{6}" class="w-full text-center text-3xl tracking-[1em] font-heading font-black px-4 py-3 border-2 border-surface-900 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 transition-colors">
                        </div>

                        <button type="submit" class="w-full bg-brand-500 text-white font-black uppercase tracking-widest text-sm py-4 hover:bg-brand-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            VERIFY CODE
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    initListeners() {
        this.container.querySelector('#otp-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp = this.container.querySelector('#otp').value;
            
            try {
                await AuthService.verifyOtp(this.email, otp);
                Toast.success('Identity Verified.');
                router.navigate(ROUTES.RESET_PASSWORD + '?email=' + encodeURIComponent(this.email) + '&token=' + otp);
            } catch (error) {
                Toast.error('Invalid OTP Code.');
            }
        });
    }
}
