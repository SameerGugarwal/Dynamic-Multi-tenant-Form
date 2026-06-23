import { AuthService } from '../../modules/auth/auth.service.mjs';

export default class RegisterView {
    constructor(match) {
        this.match = match;
    }

    async mount(container) {
        container.innerHTML = this.render();
        this.initListeners(container);
    }

    render() {
        return `
            <div class="bg-white border border-surface-200 p-10 shadow-sm w-full">
                <div class="mb-10 text-center">
                    <h1 class="text-2xl font-heading font-bold text-surface-900 uppercase tracking-widest">System Access</h1>
                    <p class="text-surface-500 text-sm mt-2 font-sans tracking-wide">Register your core identity</p>
                </div>

                <form id="register-form" class="space-y-6">
                    <div>
                        <label class="block text-xs font-bold text-surface-900 uppercase tracking-widest mb-2" for="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name"
                            required
                            class="w-full px-4 py-3 border border-surface-300 bg-transparent text-surface-900 font-sans text-sm focus:outline-none focus:border-surface-900 transition-colors rounded-none"
                        >
                    </div>

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
                        Initialize
                    </button>
                    
                    <div class="mt-6 text-center">
                        <a href="/login" data-link class="text-xs font-bold text-surface-500 hover:text-surface-900 uppercase tracking-widest transition-colors">
                            Already registered? Sign in.
                        </a>
                    </div>
                </form>
            </div>
        `;
    }

    initListeners(container) {
        const form = container.querySelector('#register-form');
        const submitBtn = container.querySelector('#submit-btn');
        const errorMsg = container.querySelector('#error-message');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const password = form.password.value.trim();

            if (!name || !email || !password) {
                errorMsg.textContent = 'Please fill in all fields.';
                errorMsg.classList.remove('hidden');
                return;
            }

            submitBtn.textContent = 'Initializing...';
            submitBtn.disabled = true;
            form.name.disabled = true;
            form.email.disabled = true;
            form.password.disabled = true;
            errorMsg.classList.add('hidden');

            try {
                // Handoff to Authentication Layer to register standard User role
                // By default the backend handles 'User' role if not specified
                await AuthService.register({ name, email, password, roleName: 'User' });
                
            } catch (error) {
                errorMsg.textContent = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
                errorMsg.classList.remove('hidden');
                
                submitBtn.textContent = 'Initialize';
                submitBtn.disabled = false;
                form.name.disabled = false;
                form.email.disabled = false;
                form.password.disabled = false;
            }
        });
    }
}
