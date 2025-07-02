import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
    if (req.url.endsWith('/auth/refresh-token')) {
        return next(req);
    }
    const authService = inject(AuthService);
    const token = authService.getJwtToken();
    const cloned = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
    return next(cloned);
};