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
  @Input() color: string = '#007bff'; // Couleur par défaut (bleu bootstrap)
  @Input() value: number = 0; // Valeur entre 0 et 100
  @Input() height: string = '20px'; // Hauteur de la barre de progression
  @Input() displayValue: boolean = true; // Afficher la valeur dans la barre de progression
  @Input() borderRadius: string = '4px'; // Bordure de la barre de progression
  
  ngOnInit(): void {
    
  }
}
