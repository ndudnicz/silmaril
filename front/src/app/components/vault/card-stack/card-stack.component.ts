import { Component, Input } from '@angular/core';
import { Login } from '../../../entities/login';
import { CardComponent } from "./card/card.component";
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-card-stack',
  standalone: true,
  imports: [
    CardComponent,
    CommonModule,
    MatDividerModule,
  ],
  templateUrl: './card-stack.component.html',
styleUrls: ['./card-stack.component.css']})
export class CardStackComponent {
  @Input() title!: string;
  @Input() logins!: Login[]; // Replace 'any' with the appropriate type if known

  constructor(private dataService: DataService) {
  }

  setSelectedLogin(login: Login) {
    console.log('Card stack clicked');
    this.dataService.setSelectedLogin(login);
  }
}
