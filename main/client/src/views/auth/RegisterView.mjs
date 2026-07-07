import { AuthService } from '../../modules/auth/auth.service.mjs';
import { Toast } from '../../components/toast/Toast.mjs';
import { Loader } from '../../components/loader/Loader.mjs';
import { ROUTES } from '../../constants/routes.mjs';
import { router } from '../../router/router.mjs';
import { AuthValidation } from '../../modules/auth/auth.validation.mjs';

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
            <div class="bg-white border border-surface-200 rounded-xl shadow-sm p-10 shadow-xl rounded-2xl animate-fade-in w-full mt-10 mb-10">                                                                                                                                                                        
                <div class="mb-10 text-center">                                                                                                               
                    <h1 class="text-3xltext-brand-900 font-medium">Create Account</h1>                               
                    <p class="text-slate-500 text-xs font-bold mt-2 font-medium">Join the platform</p>                                        
                </div>                                                                                                                                        
                                                                                                                                                                  
                <form id="register-form" class="space-y-6">                                                                                                   
                    <div>                                                                                                                                     
                        <label class="block text-xs font-semibold text-slate-800 font-medium mb-2" for="name">Full Name</label>                                              
                        <input                                                                                                                                
                            type="text"                                                                                                                       
                            id="name"                                                                                                                         
                            name="name"                                                                                                                       
                            required                                                                                                                          
                            class="w-full px-4 py-3 border border-surface-200 rounded-xl shadow-sm bg-surface-50 text-slate-800 font-bold text-sm focus:outline-none focus:ring-0 focus:border-brand-500 transition-colors"                                                                                                                     
                            placeholder="John Doe"                                                                                                            
                        >                                                                                                                                                             
                    </div>                                                                                                                                    
                                                                                                                                                                  
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
                                                                                                                                                                  
                    <div class="grid grid-cols-2 gap-4">                                                                                                      
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
        
                        <div>                                                                                                                                 
                            <label class="block text-xs font-semibold text-slate-800 font-medium mb-2" for="confirm-password">Confirm</label>    
                            <input                                                                                                                            
                                type="password"                                                                                                               
                                id="confirm-password"                                                                                                         
                                name="confirm-password"                                                                                                       
                                required                                                                                                                      
                                class="w-full px-4 py-3 border border-surface-200 rounded-xl shadow-sm bg-surface-50 text-slate-800 font-bold text-sm focus:outline-none focus:ring-0 focus:border-brand-500 transition-colors"                                                                                                                                              placeholder="••••••••"                                                                                                        
                            >                                                                                                                                 
                        </div>                                                                                                                                
                    
                    </div>                                                                                                                                    
                                                                                                                                                                  
                    <button                                                                                                                                   
                        type="submit"                                                                                                                         
                        id="submit-btn"                                                                                                                       
                        class="w-full py-4 mt-6 border border-surface-200 rounded-xl shadow-sm bg-transparent text-slate-800 font-medium tracking-wide text-sm  hover:text-white transition-colors">                                                                                                                                         
                        REGISTER                                                                                                                              
                    </button>                                                                                                                                 
                
                </form>                                                                                                                                       
                                                                                                                                                                  
                <div class="mt-6 text-center">                                                                                                                
                    <p class="text-xs font-bold text-slate-500 font-medium">                                                                  
                        Already have an account?                                                                                                              
                        <a href="#" id="link-login" class="text-slate-800 hover:underline">Sign In</a>                                                      
                    </p>                                                                                                                                      
                </div>                                                                                                                                        
            </div>                                                                                                                                            
        `;

    }
    initListeners(container) {
        const form = container.querySelector('#register-form');
        const submitBtn = container.querySelector('#submit-btn');

        // link to login page
        container.querySelector('#link-login').addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate(ROUTES.LOGIN);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const password = form.password.value.trim();
            const confirmPassword = form['confirm-password'].value.trim();
            const validationError = AuthValidation.validateRegistration(name, email, password, confirmPassword);                                                
            if (validationError) {                                                   
                Toast.warning(validationError);                                      
                return;                                                              
            }
            // UI Loading state
            submitBtn.textContent = 'REGISTERING...';
            submitBtn.disabled = true;
            Array.from(form.elements).forEach(el => el.disabled = true);
            Loader.show('CREATING ACCOUNT....');

            //  api call 
            const result = await AuthService.register({ name, email, password});
            Loader.hide();

            if (result.success) {
                Toast.success('Account Created Successfully!..');
                router.navigate(ROUTES.LOGIN);
            } else {
                Toast.error(result.error || 'Registration failed');

                // failure par form re-enable karo
                submitBtn.textContent = 'REGISTER';
                submitBtn.disabled = false;
                Array.from(form.elements).forEach(el => el.disabled = false);
            }
        });
    }

}
