import { Routes } from '@angular/router';
import { UnlockComponent } from './components/unlock/unlock.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, authNoAuthGuard, vaultUnlocked } from './guards/route.guards';
import { VaultComponent } from './components/vault/vault.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
    {
        path: '', component: LayoutComponent, children: [
            { path: 'unlock', component: UnlockComponent, canActivate: [authGuard] },
            { path: 'signin', component: SigninComponent, canActivate: [authNoAuthGuard] },
            { path: 'signup', component: SignupComponent, canActivate: [authNoAuthGuard] },
            { path: 'vault', component: VaultComponent, canActivate: [authGuard, vaultUnlocked] },
            { path: '', redirectTo: '/unlock', pathMatch: 'full' },
            { path: '**', redirectTo: '/unlock' }
        ]
    }
];
