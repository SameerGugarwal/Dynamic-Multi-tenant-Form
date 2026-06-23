import { TokenService } from '../services/token.service.mjs';
import { ROUTES } from '../constants/routes.mjs';

export const roleRoute = (router, allowedRoles) => (match) => {
    const role = TokenService.getUserRole();
    if (!allowedRoles.includes(role)) {
        router.navigate(ROUTES.UNAUTHORIZED);
        return false;
    }
    return true;
};
