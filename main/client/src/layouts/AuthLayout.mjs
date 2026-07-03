export default class AuthLayout {
    async mount( container, viewInstance){
        container.className = 'min-h-screen bg-surface-50 font-sans text-surface-900 flex flex-col items-center justify-center';
        container.innerHTML = `
            <!-- The auth views (Login/Register) will mount their cards inside this div -->          
                <main id="auth-content" class=" max-w-md px-6 w-full"></main>   
        `;
        // Safely mount the view (LoginView or RegisterView) inside the container  
        if (viewInstance && typeof viewInstance.mount === 'function'){
            await viewInstance.mount(container.querySelector('#auth-content'));
        }else{
            console.error('AuthLayout: No valid view instance provided to mount.');
        }
    }   
}