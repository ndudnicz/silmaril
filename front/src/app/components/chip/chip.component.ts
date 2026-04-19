import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
})
export class ChipComponent {
  public readonly label = input.required<string>();
}
