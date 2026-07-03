export default class DashboardLayout {
    async mount (container, viewInstance){
        container.innerHTML = '<div id="dashboard-content" class="w-full min-h-screen"></div>';  

        if(viewInstance && typeof viewInstance.mount === 'function'){
            await viewInstance.mount(container.querySelector('#dashboard-content'));
        }
    }
}