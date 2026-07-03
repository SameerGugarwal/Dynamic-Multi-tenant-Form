import { Sidebar } from '../components/sidebar/Sidebar.mjs';
import { Navbar } from '../components/navbar/Navbar.mjs';

/**
     * Renders a strictly monochromatic, perfectly centered flex container.
     * @param {HTMLElement} container - The root app container
     * @param {Object} viewInstance - The instantiated View to inject
*/

export default class UserLayout {
    async mount(container, viewInstance) {
        // Your flexbox layout wrapper
        container.className = 'min-h-screen bg-surface-50 flex font-sans';
        
        const sidebar = new Sidebar('USER');
        const navbar = new Navbar();

        container.innerHTML = `
            <div id="layout-sidebar"></div>
            
            <div class="flex-1 ml-64 flex flex-col min-h-screen relative overflow-hidden">
                <!-- We mount the reusable Navbar here instead of hardcoding it -->
                <div id="layout-navbar" class="sticky top-0 z-30 w-full"></div>

                <!-- Your scrolling content area -->
                <main id="layout-content" class="flex-1 p-8 overflow-y-auto relative z-10 custom-scrollbar"></main>
            </div>
        `;

        // Mount Sidebar
        const sidebarContainer = container.querySelector('#layout-sidebar');
        sidebarContainer.innerHTML = sidebar.render();
        sidebar.attachEvents(sidebarContainer);

        // Mount Navbar
        navbar.mount(container.querySelector('#layout-navbar'));

        // Mount View (with the safe check!)
        const contentContainer = container.querySelector('#layout-content');
        if (viewInstance && typeof viewInstance.mount === 'function') {
            await viewInstance.mount(contentContainer);
        } else {
            console.error(' UserLayout : No valid view instance provided to mount.');
        }
    }
}