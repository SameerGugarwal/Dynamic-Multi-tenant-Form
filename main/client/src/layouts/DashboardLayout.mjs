import { Sidebar } from '../components/sidebar/Sidebar.mjs';
export default class DashboardLayout {
    mount(container, contentHtml) {
        container.innerHTML = '<div class="flex h-screen bg-surface-50"><div id="sidebar-container" class="w-64 border-r-2 border-surface-900 bg-white hidden md:block"></div><div class="flex-1 flex flex-col overflow-hidden"><main class="flex-1 overflow-x-hidden overflow-y-auto bg-surface-50 p-6">' + contentHtml + '</main></div></div>';
        const sidebar = new Sidebar();
        sidebar.mount(container.querySelector('#sidebar-container'));
    }
}
