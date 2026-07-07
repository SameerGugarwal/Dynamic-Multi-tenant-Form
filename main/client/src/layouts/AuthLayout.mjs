export default class AuthLayout {
    async mount( container, viewInstance){
        container.className = 'min-h-screen bg-surface-50 flex items-center justify-center font-sans p-4';
        container.innerHTML = `
            <!-- The Modal Container -->
            <div class="w-full max-w-md bg-white border border-surface-200 rounded-2xl p-10 relative z-10 shadow-xl">
                <!-- We'll mount the Login/Register view inside this div -->
                <div id="auth-content"></div>
            </div>
        `;
        // Safely mount the view (LoginView or RegisterView) inside the container  
        if (viewInstance && typeof viewInstance.mount === 'function'){
            await viewInstance.mount(container.querySelector('#auth-content'));
        }else{
            console.error('AuthLayout: No valid view instance provided to mount.');
        }
    }   
}