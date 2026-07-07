export class Loader {
    static show(message = 'LOADING...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-fade-in';
            loader.innerHTML = `<div class="relative w-12 h-12">
                                    <div class="absolute inset-0 border-4 border-surface-100 rounded-full"></div>
                                    <div class="absolute inset-0 border-t-4 border-brand-700 rounded-full animate-spin"></div>
                                </div>
                                <p class="mt-4 text-slate-600 font-medium text-sm" id="global-loader-text">
                                </p>
            `;
            loader.querySelector('#global-loader-text').textContent = message;
            document.body.appendChild(loader);
        }else{
            loader.querySelector('#global-loader-text').textContent = message;
            loader.style.display = 'flex';
        }
    }
    static hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        };
    }
}
