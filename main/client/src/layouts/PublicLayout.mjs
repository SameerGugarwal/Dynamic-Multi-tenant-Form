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
                <!-- Top Navigation Bar -->           
                <nav class="fixed top-0 w-full z-50 bg-surface-50/90 backdrop-blur-md border-b border-surface-200 transition-all duration-300">           
                    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">            
                        <!-- Brand/Logo -->           
                        <div class="text-2xl font-heading font-black tracking-widest uppercase cursor-pointer" id="nav-logo">                             
                            -TOPO                     
                        </div>                        
                                                      
                        <!-- Actions -->              
                        <div class="flex items-center gap-6">                                             
                            <button id="nav-login-btn" class="text-sm font-bold tracking-widest uppercase hover:text-brand-600 transition-colors">            
                                Login                 
                            </button>                 
                            <button id="nav-register-btn" class="px-6 py-2.5 border-2 border-surface-900 text-sm font-bold tracking-widest uppercase hover:bg-surface-900 hover:text-white transition-colors">    
                                Register              
                            </button>                 
                        </div>                        
                    </div>                            
                </nav>                                
                                                      
                <!-- Main Content Area -->            
                <main id="layout-content" class="w-full pt-20 flex-1"></main>                          
                                                      
                <!-- Ultra-minimalist Footer -->      
                <footer class="bg-brand-950 text-surface-50 py-12 border-t border-surface-900 mt-20">
                    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                        <div class="text-xl font-heading font-black tracking-widest uppercase mb-4 md:mb-0">
                            -TOPO
                        </div>
                        <div class="text-brand-400 text-xs font-bold tracking-widest uppercase">       
                            &copy; ${new Date().getFullYear()} TOPO SYSTEMS. ALL RIGHTS RESERVED.   
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
