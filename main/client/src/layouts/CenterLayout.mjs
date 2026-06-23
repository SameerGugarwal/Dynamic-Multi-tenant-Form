export default class CenterLayout {
    /**
     * Renders a strictly monochromatic, perfectly centered flex container.
     * @param {HTMLElement} container - The root app container
     * @param {Object} viewInstance - The instantiated View to inject
     */
    async mount(container, viewInstance) {
        // Flat, precise geometric full-screen container (no topography, no gradients)
        container.className = 'min-h-screen bg-surface-50 flex items-center justify-center';
        
        container.innerHTML = `
            <div id="layout-content" class="w-full max-w-md p-6"></div>
        `;

        const contentContainer = container.querySelector('#layout-content');
        
        if (viewInstance) {
            await viewInstance.mount(contentContainer);
        }
    }
}
