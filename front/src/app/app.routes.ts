import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { authGuard, authNoAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    // { path: 'home', component: HomeComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'signin', component: SigninComponent, canActivate: [authNoAuthGuard] },
    { path: 'signup', component: SignupComponent, canActivate: [authNoAuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home' }
];
