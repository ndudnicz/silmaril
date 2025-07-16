import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Login } from '../../entities/login';
import { CardStackComponent } from './card-stack/card-stack.component';

@Component({
  selector: 'app-card-stacks',
  imports: [
    CardStackComponent
  ],
  templateUrl: './card-stacks.component.html',
  styleUrl: './card-stacks.component.css'
})
export class CardStacksComponent implements OnInit, OnChanges {
  @Input() displayedLogins!: Login[];
  @Output() clickEvent: EventEmitter<Login> = new EventEmitter<Login>();

  displayedLoginStackEntries: KeyValue<string, Login[]>[] = [];

  ngOnInit(): void {
    this.computeStacks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayedLogins']) {
      this.computeStacks();
    }
  }

  computeStacks() {
    let loginStacks: any = {};
    for (const login of this.displayedLogins) {
      const stackName = login.decryptedData?.title.charAt(0).toLocaleUpperCase() || 'Uncategorized';
      if (!loginStacks[stackName]) {
        loginStacks[stackName] = [];
      }
      loginStacks[stackName].push(login);
    }
    this.displayedLoginStackEntries = Object.entries(loginStacks as Record<string, Login[]>)
      .map(([key, value]) => ({ key, value }));
    this.displayedLoginStackEntries.sort((a, b) => a.key.localeCompare(b.key));
  }
}
