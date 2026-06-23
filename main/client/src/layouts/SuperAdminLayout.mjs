import { Sidebar } from '../components/sidebar/Sidebar.mjs';

export default class SuperAdminLayout {
    async mount(container, viewInstance) {
        container.className = 'min-h-screen bg-surface-50 flex font-sans';
        const sidebar = new Sidebar('SUPER_ADMIN');
        
        const userProfile = JSON.parse(localStorage.getItem('topo_user_profile') || '{}');

        container.innerHTML = `
            <div id="layout-sidebar"></div>
            
            <div class="flex-1 ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <header class="h-16 bg-white border-b-2 border-surface-900 flex items-center justify-between px-8 sticky top-0 z-30">
                    <h1 class="text-sm font-heading font-black uppercase tracking-widest text-surface-900" id="header-title">SYSTEM_OVERVIEW</h1>
                    
                    <div class="flex items-center gap-4 cursor-pointer hover:bg-surface-100 transition-colors border-2 border-surface-900 p-1 px-3">
                        <span class="text-xs font-bold uppercase tracking-widest">${userProfile.name || 'ADMIN'}</span>
                    </div>
                </header>

                <main id="layout-content" class="flex-1 p-8 overflow-y-auto relative z-10 custom-scrollbar"></main>
            </div>
        `;

        const sidebarContainer = container.querySelector('#layout-sidebar');
        sidebarContainer.innerHTML = sidebar.render();
        sidebar.attachEvents(sidebarContainer);

        const contentContainer = container.querySelector('#layout-content');
        if (viewInstance) {
            await viewInstance.mount(contentContainer);
        }
    }
}
