import Navigo from 'navigo';
import { routesConfig } from './routes.mjs';
import { TokenService } from '../services/token.service.mjs';
import { ROUTES } from '../constants/routes.mjs';

class AppRouter {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;
        // Initialize Navigo using standard history API (no hash routing)
        this.router = new Navigo('/', { hash: false });
        this.setupRoutes();
    }

    setupRoutes() {
        // 1. Iterate over our route configuration array and register each with Navigo
        routesConfig.forEach((route) => {
            this.router.on(route.path, async (match) => {
                await this.handleRouteMatch(route, match);
            });
        });

        // 2. 404 Fallback logic
        this.router.notFound(() => {
            console.error(`404: Route not found.`);
            this.navigate(ROUTES.LOGIN);
        });
    }

    init() {
        // Kick off the router and resolve the current browser URL
        this.router.resolve();
    }

    navigate(path) {
        this.router.navigate(path);
    }

    async handleRouteMatch(routeConfig, match) {
        // Guard Check 1: Authentication enforcement
        const authenticated = TokenService.isAuthenticated();
        if (routeConfig.requiresAuth && !authenticated) {
            console.warn('Protected route accessed without session. Redirecting to login.');
            this.navigate(ROUTES.LOGIN);
            return;
        }

        // Guard Check 2: Role-Based Access Control (RBAC) enforcement
        if (routeConfig.requiresAuth && routeConfig.allowedRoles) {
            // FIX: We must fetch the role string name from localStorage (saved during login) 
            // since the backend token only provides an ObjectId ('roleId').
            const userRoleName = localStorage.getItem('topo_user_role_name');
            
            if (!userRoleName || !routeConfig.allowedRoles.includes(userRoleName)) {
                console.error(`RBAC Denied: Role ${userRoleName} unauthorized for path ${routeConfig.path}`);
                this.navigate(ROUTES.LOGIN); 
                return;
            }
        }

        // If all guards pass, render the layout and view
        await this.renderView(routeConfig, match);
    }

    async renderView(routeConfig, match) {
        try {
            // Show a temporary loading state (optional but good practice)
            this.appContainer.innerHTML = '<div class="flex items-center justify-center min-h-screen"><div class="animate-pulse-soft text-brand-500">Loading...</div></div>';

            // 1. Lazily import the View module on demand and instantiate it.
            // We pass the Navigo 'match' object so the view can read URL parameters (e.g. /forms/:id)
            const viewModule = await routeConfig.view();
            const ViewInstance = new viewModule.default(match);

            // Clear the loading state
            this.appContainer.innerHTML = '';

            // 2. Layout Wrapping Strategy
            if (routeConfig.layout) {
                // Dynamically import the layout class based on the layout name string
                const layoutModule = await import(`../layouts/${routeConfig.layout}.mjs`);
                const LayoutInstance = new layoutModule.default();
                
                // The layout mounts itself into the app container, 
                // and takes responsibility for rendering the ViewInstance inside its content area.
                await LayoutInstance.mount(this.appContainer, ViewInstance);
            } else {
                // If there is no layout defined, mount the view directly to the body
                await ViewInstance.mount(this.appContainer);
            }
            
        } catch (error) {
            console.error('Routing Render Critical Failure:', error);
            this.appContainer.innerHTML = '<h1 class="text-red-500 text-center mt-10">A critical rendering error occurred.</h1>';
        }
    }
}

// Export a singleton instance of our Navigo-powered router
export const router = new AppRouter();
