import { TokenService } from '../services/token.service.mjs';
import { ROUTES } from '../constants/routes.mjs';

export const protectedRoute = (router) => (match) => {
    if (!TokenService.getToken()) {
        router.navigate(ROUTES.LOGIN);
        return false;
    }
    return true;
};
