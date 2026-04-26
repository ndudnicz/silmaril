import { Component, input, output } from '@angular/core';
import { Credential } from '../../../entities/credential';
import { CardComponent } from './card/card.component';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-card-stack',
  standalone: true,
  imports: [CardComponent, DividerModule],
  templateUrl: './card-stack.component.html',
})
export class CardStackComponent {
  public readonly title = input.required<string>();
  public readonly credentials = input.required<Credential[]>();
  protected readonly clickEvent = output<Credential>();
}
