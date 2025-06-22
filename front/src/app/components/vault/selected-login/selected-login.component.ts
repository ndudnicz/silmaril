import { Component, Input } from '@angular/core';
import { Login } from '../../../entities/login';
import { DataService } from '../../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-selected-login',
  imports: [],
  templateUrl: './selected-login.component.html',
  styleUrl: './selected-login.component.css'
})
export class SelectedLoginComponent {
  login!: Login | null;

  constructor(private dataService: DataService) {
    console.log('SelectedLoginComponent initialized');
    this.dataService.selectedLogin.subscribe((login: Login | null) => {
        this.login = login;
        console.log('SelectedLoginComponent : Selected login updated:', this.login);
    });
  }
}
