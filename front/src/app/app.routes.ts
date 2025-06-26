import { Routes } from '@angular/router';
import { UnlockComponent } from './components/unlock/unlock.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, authNoAuthGuard, vaultUnlocked } from './guards/route.guards';
import { VaultComponent } from './components/vault/vault.component';
import { LayoutComponent } from './components/layout/layout.component';
import { WhatIsMasterPasswordComponent } from './components/what-is-master-password/what-is-master-password.component';
import { FaqComponent } from './components/faq/faq.component';

const title = 'Silmaril - Password Manager';
export const routes: Routes = [
    {
        path: '', title: title, component: LayoutComponent, children: [
            { path: 'unlock', title: title + ': Unlock', component: UnlockComponent, canActivate: [authGuard] },
            { path: 'signin', title: title + ': Sign in', component: SigninComponent, canActivate: [authNoAuthGuard] },
            { path: 'signup', title: title + ': Sign up', component: SignupComponent, canActivate: [authNoAuthGuard] },
            { path: 'vault', title: title + ': Vault', component: VaultComponent, canActivate: [authGuard, vaultUnlocked] },
            { path: 'what-is-master-password', title: title + ': What is a master password', component: WhatIsMasterPasswordComponent },
            { path: 'faq', title: title + ': FAQ', component: FaqComponent },
            { path: '', redirectTo: '/unlock', pathMatch: 'full' },
            { path: '**', redirectTo: '/unlock' }
        ]
    }
];