import { AuthService } from '../../modules/auth/auth.service.mjs';

export default class LoginView {
    constructor(match) {
        this.match = match;
    }

    async mount(container) {
        container.innerHTML = this.render();
        this.initListeners(container);
    }

    render() {
        return `
            <div class="bg-white border border-surface-200 p-10 shadow-sm">
                <div class="mb-10 text-center">
                    <h1 class="text-2xl font-heading font-bold text-surface-900 uppercase tracking-widest">Welcome Back</h1>
                    <p class="text-surface-500 text-sm mt-2 font-sans tracking-wide">Sign in to your system</p>
                </div>

                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-surface-900 uppercase tracking-widest mb-2" for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            required
                            class="w-full px-4 py-3 border border-surface-300 bg-transparent text-surface-900 font-sans text-sm focus:outline-none focus:border-surface-900 transition-colors rounded-none"
                        >
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-surface-900 uppercase tracking-widest mb-2" for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            required
                            class="w-full px-4 py-3 border border-surface-300 bg-transparent text-surface-900 font-sans text-sm focus:outline-none focus:border-surface-900 transition-colors rounded-none"
                        >
                    </div>

                    <div id="error-message" class="text-red-600 text-xs font-medium hidden"></div>

                    <button 
                        type="submit" 
                        id="submit-btn"
                        class="w-full py-4 mt-4 border-2 border-surface-900 bg-transparent text-surface-900 font-bold uppercase tracking-widest text-xs hover:bg-surface-900 hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        `;
    }

    initListeners(container) {
        const form = container.querySelector('#login-form');
        const submitBtn = container.querySelector('#submit-btn');
        const errorMsg = container.querySelector('#error-message');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            const password = form.password.value.trim();

            // Client-side validation
            if (!email || !password) {
                errorMsg.textContent = 'Please fill in all fields.';
                errorMsg.classList.remove('hidden');
                return;
            }

            // UI Loading state
            submitBtn.textContent = 'Authenticating...';
            submitBtn.disabled = true;
            form.email.disabled = true;
            form.password.disabled = true;
            errorMsg.classList.add('hidden');

            try {
                // Handoff to Authentication Layer
                await AuthService.login(email, password);
                
                // Note: We don't re-enable the button on success because the router immediately navigates
            } catch (error) {
                // UI Error state
                errorMsg.textContent = error.message || 'Invalid credentials. Please try again.';
                errorMsg.classList.remove('hidden');
                
                // Reset button and inputs
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
                form.email.disabled = false;
                form.password.disabled = false;
            }
        });
    }
}
