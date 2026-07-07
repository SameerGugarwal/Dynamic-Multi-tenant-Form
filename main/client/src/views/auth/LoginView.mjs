import { AuthService } from '../../modules/auth/auth.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { Loader } from '../../components/loader/Loader.mjs';
import { ROUTES } from '../../constants/routes.mjs';
import { router } from '../../router/router.mjs';
import { TokenService } from '../../services/token.service.mjs';
import { ROLES } from '../../constants/roles.mjs';

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
            <div class="bg-white border border-surface-200 rounded-xl shadow-sm p-10 shadow-xl rounded-2xl animate-fade-in w-full  ">
                
                <div class="mb-10 text-center">
                    <h1 class="text-3xltext-brand-900 font-medium">Welcome Back</h1>
                    <p class="text-slate-500 text-xs font-bold mt-2 font-medium">Sign in to your system</p>
                </div>

                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-xs font-semibold text-slate-800 font-medium mb-2" for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            required
                            class="w-full px-4 py-3 border border-surface-200 rounded-xl shadow-sm bg-surface-50 text-slate-800 font-bold text-sm focus:outline-none focus:ring-0 focus:border-brand-500 transition-colors"
                            placeholder="admin@example.com"
                        >
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-800 font-medium mb-2" for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            required
                            class="w-full px-4 py-3 border border-surface-200 rounded-xl shadow-sm bg-surface-50 text-slate-800 font-bold text-sm focus:outline-none focus:ring-0 focus:border-brand-500 transition-colors"
                            placeholder="••••••••"
                        >
                    </div>

                    <button 
                        type="submit" 
                        id="submit-btn"
                        class="w-full py-4 mt-4 border border-surface-200 rounded-xl shadow-sm bg-transparent text-slate-800 font-medium tracking-wide text-sm  hover:text-white transition-colors"
                    >
                        SIGN IN
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-xs font-bold text-slate-500 font-medium">
                        Don't have an account? 
                        <a href="#" id="link-register" class="text-slate-800 hover:underline">Register</a>
                    </p>
                </div>
            </div>
        `;
    }

    initListeners(container) {
        const form = container.querySelector('#login-form');
        const submitBtn = container.querySelector('#submit-btn');
        
        // Link to register page
        container.querySelector('#link-register').addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate(ROUTES.REGISTER);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value.trim();
            const password = form.password.value.trim();

            // Client-side validation
            if (!email || !password) {
                Toast.warning('Please fill in all fields.');
                return;
            }   

            // UI Loading state combined with our Loader component
            submitBtn.textContent = 'AUTHENTICATING...';
            submitBtn.disabled = true;
            form.email.disabled = true;
            form.password.disabled = true;
            
            Loader.show('AUTHENTICATING...');
            
            // API call
            const result = await AuthService.login(email, password);
            
            Loader.hide();

            if (result.success) {
                Toast.success('Login Successful');
                
                // Redirect based on role
                const role = TokenService.getUserRole();
                
              
                
            

                // if (role === 'SUPER_ADMIN') router.navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
                // else if (role === 'CENTER_ADMIN') router.navigate(ROUTES.CENTER_DASHBOARD);
                // else if (role === 'ORG_ADMIN') router.navigate(ROUTES.ORG_DASHBOARD);
                // else router.navigate(ROUTES.USER_DASHBOARD);

                if (role === ROLES.SUPER_ADMIN) router.navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
                else if (role === ROLES.CENTER_ADMIN) router.navigate(ROUTES.CENTER_DASHBOARD);
                else if (role === ROLES.ORG_ADMIN) router.navigate(ROUTES.ORG_DASHBOARD);
                else router.navigate(ROUTES.USER_DASHBOARD);
                
            } else {
                Toast.error(result.error || 'Invalid credentials');
                // Re-enable form on failure
                submitBtn.textContent = 'SIGN IN';
                submitBtn.disabled = false;
                form.email.disabled = false;
                form.password.disabled = false;
            }
        });
    }
}

