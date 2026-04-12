import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  imports: [CommonModule],
})
export class ProgressBarComponent {
  public readonly color = input<string>('#007bff');
  public readonly value = input<number>(0);
  public readonly height = input<string>('20px');
  public readonly displayValue = input<boolean>(true);
  public readonly borderRadius = input<string>('4px');
}
