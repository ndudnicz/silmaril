import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css'],
  imports: [CommonModule]
})
export class ProgressBarComponent implements OnInit {
  @Input() color: string = '#007bff';
  @Input() value: number = 0;
  @Input() height: string = '20px';
  @Input() displayValue: boolean = true;
  @Input() borderRadius: string = '4px';
  
  ngOnInit(): void {
    
  }
}
