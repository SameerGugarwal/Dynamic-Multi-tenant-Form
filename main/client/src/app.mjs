// src/app.mjs
import { router } from './router/router.mjs';

export class App {
    constructor() {
        this.appContainer = document.getElementById('app');
    }

    init() {
        console.log('App initialized. Kickstarting the router...');
        
        // 1. Start the Navigo Router
        // This will resolve the current URL, run the RBAC checks, and mount the correct Layout/View
        router.init();

        // 2. Setup Global Error Catching
        // Prevents the app from failing silently if an unexpected promise rejects
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection caught at App boundary:', event.reason);
            // In the future, we can trigger a global Toast notification here
        });

        // 3. Global click interceptor for internal SPA links
        // This ensures standard <a href="/route"> tags use our Navigo router instead of a full page reload.
        document.body.addEventListener('click', (e) => {
            // Find if a link was clicked
            const link = e.target.closest('a');
            
            // If it's an internal link (starts with / and isn't targeting a new tab)
            if (link && link.getAttribute('href')?.startsWith('/') && link.target !== '_blank') {
                e.preventDefault();
                router.navigate(link.getAttribute('href'));
            }
        });
    }
}
