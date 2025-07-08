import { Routes } from '@angular/router';
import { UnlockComponent } from './components/unlock/unlock.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, authNoAuthGuard, vaultUnlocked } from './guards/route.guards';
import { VaultComponent } from './components/vault/vault.component';
import { LayoutComponent } from './components/layout/layout.component';
import { WhatIsMasterPasswordComponent } from './components/what-is-master-password/what-is-master-password.component';
import { FaqComponent } from './components/faq/faq.component';
import { SettingsComponent } from './components/settings/settings.component';

const title = 'Silmaril - Password Manager';
export const routes: Routes = [
    { path: 'what-is-master-password', title: title + ': What is a master password', component: WhatIsMasterPasswordComponent },
    { path: 'faq', title: title + ': FAQ', component: FaqComponent },
    { path: 'signin', title: title + ': Sign in', component: SigninComponent, canActivate: [authNoAuthGuard] },
    { path: 'signup', title: title + ': Sign up', component: SignupComponent, canActivate: [authNoAuthGuard] },
    {
        path: '', title: title, component: LayoutComponent, children: [
            { path: 'unlock', title: title + ': Unlock', component: UnlockComponent, canActivate: [authGuard] },
            { path: 'vault/:id', title: title + ': Vault', component: VaultComponent, canActivate: [authGuard, vaultUnlocked] },
            { path: 'settings', title: title + ': Settings', component: SettingsComponent, canActivate: [authGuard] },
            { path: '', redirectTo: 'unlock', pathMatch: 'full' },
            { path: '**', redirectTo: 'unlock', pathMatch: 'full' }
        ]
    }
];