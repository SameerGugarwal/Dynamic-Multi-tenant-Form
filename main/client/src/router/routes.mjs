import { ROUTES } from "../constants/routes.mjs";

export const routesConfig = [
    {
        path: ROUTES.HOME,
        view: () => import('../views/LandingView.mjs'),
        layout: 'PublicLayout',
        requiresAuth: false
    },
    {
        path: ROUTES.LOGIN,
        view: ()=> import('../views/auth/LoginView.mjs'),
        layout: 'CenterLayout',
        requiresAuth: false
    },
    {
        path: ROUTES.REGISTER,
        view: ()=> import('../views/auth/RegisterView.mjs'),
        layout: 'CenterLayout',
        requiresAuth: false
    },
    {
        path: ROUTES.SUPER_ADMIN_DASHBOARD,
        view: () => import('../views/super-admin/DashboardView.mjs'),
        layout: 'SuperAdminLayout',
        requiresAuth: true,
        allowedRoles: ['SUPER_ADMIN']
    },
    {
        path: ROUTES.SUPER_ADMIN_CENTERS,
        view: () => import('../views/super-admin/CentersView.mjs'),
        layout: 'SuperAdminLayout',
        requiresAuth: true,
        allowedRoles: ['SUPER_ADMIN']
    },
    {
        path: ROUTES.SUPER_ADMIN_FORMS,
        view: () => import('../views/organization/FormsView.mjs'),
        layout: 'SuperAdminLayout',
        requiresAuth: true,
        allowedRoles: ['SUPER_ADMIN']
    },
    {
        path: ROUTES.SUPER_ADMIN_ORGS,
        view: () => import('../views/super-admin/OrganizationsView.mjs'),
        layout: 'SuperAdminLayout',
        requiresAuth: true,
        allowedRoles: ['SUPER_ADMIN']
    },
    {
        path: ROUTES.ORG_DASHBOARD,
        view: () => import('../views/organization/DashboardView.mjs'),
        layout: 'OrganizationLayout',
        requiresAuth: true,
        allowedRoles: ['ORG_ADMIN']
    },
    {
        path: ROUTES.ORG_USERS,
        view: () => import('../views/organization/UsersView.mjs'),
        layout: 'OrganizationLayout',
        requiresAuth: true,
        allowedRoles: ['ORG_ADMIN']
    },
    {
        path: ROUTES.ORG_FORMS,
        view: () => import('../views/organization/FormsView.mjs'),
        layout: 'OrganizationLayout',
        requiresAuth: true,
        allowedRoles: ['ORG_ADMIN']
    },
    {
        path: ROUTES.USER_DASHBOARD,
        view: () => import('../views/user/DashboardView.mjs'),
        layout: 'UserLayout',
        requiresAuth: true,
        allowedRoles: ['USER', 'ORG_ADMIN', 'SUPER_ADMIN']
    },
    {
        path: ROUTES.USER_FORMS,
        view: () => import('../views/user/MyFormsView.mjs'),
        layout: 'UserLayout',
        requiresAuth: true,
        allowedRoles: ['USER', 'ORG_ADMIN', 'SUPER_ADMIN']
    }
];
