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
export class CardComponent implements OnChanges {
  @Input() login!: Login;
  @Input() enableSelectedFeature: boolean = false;
  @Input() unselectTrigger: number = 0;
  @Output() clickEvent: EventEmitter<Login> = new EventEmitter<Login>();

  isSelected = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unselectTrigger']) {
      this.isSelected = false;
    }
  }

  click(): void {
    if (this.enableSelectedFeature) {
      this.toggleSelection();
    }
    this.clickEvent.emit(this.login);
  }

  toggleSelection(): void {
    this.isSelected = !this.isSelected;
  }
}
