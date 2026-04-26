import { Component, input, output } from '@angular/core';
import { ChipComponent } from '../../../chip/chip.component';
import { CommonModule } from '@angular/common';
import { Credential } from '../../../../entities/credential';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [CommonModule, ChipComponent, ButtonModule],
})
export class CardComponent {
  public readonly credential = input.required<Credential>();
  protected readonly clickEvent = output<Credential>();

  click(): void {
    this.clickEvent.emit(this.credential());
  }
}
