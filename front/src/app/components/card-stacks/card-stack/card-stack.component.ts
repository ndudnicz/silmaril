import { Component, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
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
  @Input() logins!: Login[];
  @Input() enableSelectedFeature: boolean = false;
  @Input() unselectAllTrigger: number = 0;

  @Output() clickEvent: EventEmitter<Login> = new EventEmitter<Login>();

  constructor() {}
}
