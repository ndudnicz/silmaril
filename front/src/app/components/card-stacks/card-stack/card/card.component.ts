import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ChipComponent } from '../../../chip/chip.component';
import { CommonModule } from '@angular/common';
import { Login } from '../../../../entities/login';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ChipComponent,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ]
})
export class CardComponent {
  @Input() login!: Login;
  @Output() clickEvent: EventEmitter<Login> = new EventEmitter<Login>();

  click(): void {
    this.clickEvent.emit(this.login);
  }
}
