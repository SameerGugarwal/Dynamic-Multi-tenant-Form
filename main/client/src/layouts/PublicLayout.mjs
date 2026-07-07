import { router } from '../router/router.mjs';

/**
     * Renders a layout for public facing pages (Landing, About, etc.)
     * @param {HTMLElement} container 
     * @param {Object} viewInstance 
*/

export default class PublicLayout {
    async mount(container, viewInstance) {
        container.className = 'min-h-screen bg-surface- 50 font- sans text-surface-900 flex flex-col';

        container.innerHTML = `
                <!-- Ultra-minimalist Navbar -->
                <nav class="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-surface-200 transition-all duration-300">
                    <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                        <!-- Logo -->
                        <div id="nav-logo" class="text-2xltext-brand-900 cursor-pointer">
                            TopoForms                     
                        </div>                        
                                                      
                        <!-- Actions -->              
                        <div class="flex items-center gap-6">                                             
                            <button id="nav-login-btn" class="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors">            
                                Login                 
                            </button>                 
                            <button id="nav-register-btn" class="px-6 py-2.5 bg-brand-700 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors shadow-sm">    
                                Register              
                            </button>                 
                        </div>                        
                    </div>                            
                </nav>                                
                                                      
                <!-- Main Content Area -->            
                <main id="layout-content" class="w-full pt-20 flex-1"></main>                          
                                                      
                <!-- Ultra-minimalist Footer -->      
                <footer class="bg-slate-900 text-surface-50 py-12 mt-20">
                    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                        <div class="text-xl font-heading font-semibold mb-4 md:mb-0">
                            TopoForms
                        </div>
                        <div class="text-slate-400 text-sm font-medium">       
                            &copy; ${new Date().getFullYear()} ENOVATE-IT. ALL RIGHTS RESERVED.   
                        </div>
                    </div>
                </footer>
        `;

        // Wire up navigation
        container.querySelector('#nav-logo').addEventListener('click', () => router.navigate('/'));
        
        container.querySelector('#nav-login-btn').addEventListener('click', () => router.navigate('/login'));
        
        container.querySelector('#nav-register-btn').addEventListener('click', () => router.navigate('/register'));

            // THE MISSING LINE: Actually mount the view inside the layout!
        if (viewInstance && typeof viewInstance.mount === 'function') {
            await viewInstance.mount(container.querySelector('#layout-content'));
        } 
        else {
            console.error('PublicLayout: No valid view instance provided to mount.');
        }
    }
}
