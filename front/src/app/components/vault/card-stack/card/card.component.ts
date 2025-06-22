import { Component, Input } from '@angular/core';
import { ChipComponent } from '../../../chip/chip.component';
import { CommonModule } from '@angular/common';
import { Login } from '../../../../entities/login';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ChipComponent
  ]
})
export class CardComponent {
  @Input() login!: Login;
}
