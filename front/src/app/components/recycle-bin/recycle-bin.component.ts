import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../base-component/base-component.component';
import { MatIconModule } from '@angular/material/icon';
import { Login } from '../../entities/login';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recycle-bin',
  imports: [
    MatIconModule,
    CardStacksComponent,
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css'
})
export class RecycleBinComponent extends BaseComponent implements OnInit {
  
  searchValue: string = '';
  searchBarPlaceholder = 'Search in Recycle Bin';
  allDeletedLogins: Login[] = [];
  displayedLogins: Login[] = [];
  subscription: Subscription = new Subscription();

  constructor(
    private dataService: DataService
  ) {
    super(inject(NgxSpinnerService));
  }

  ngOnInit(): void {
    this.startLoading();
    this.setupSubscriptions();
    this.allDeletedLogins = this.dataService.getRecycleBinLogins() ?? [];
    console.log('recycle bin ngoninit', this.allDeletedLogins);
    this.stopLoading(); 
    // this.dataService.getRecycleBinLogins.pipe(take(1)).subscribe(logins => {
    //   this.allDeletedLogins = logins;
    //   this.setDisplayedLogins();
    //   this.stopLoading();
    // });
  }
  
  setupSubscriptions() {
    // this.subscription.add(
    //   this.dataService.getRecycleBinLogins.subscribe(logins => {
    //     this.allDeletedLogins = logins;
    //     this.setDisplayedLogins();
    //   })
    // );
  }

  setDisplayedLogins() {
    if (this.allDeletedLogins) {
      this.displayedLogins = this.allDeletedLogins.filter(login => login.deleted);
    } else {
      this.displayedLogins = [];
    }
  }

  restoreLogin(loginId: string): void {
    console.log(`Restoring login with ID: ${loginId}`);
  }

  permanentlyDeleteLogin(loginId: string): void {
    console.log(`Permanently deleting login with ID: ${loginId}`);
  }

  search(value: string) {
    this.searchValue = value;
    if (this.searchValue.trim() === '') {
      this.setDisplayedLogins();
    } else {
      this.displayedLogins = this.allDeletedLogins.filter(login => {
        const title = login.decryptedData?.title || '';
        return title.toLowerCase().includes(this.searchValue.toLowerCase());
      });
    }
  }

  clearSearch() {
    this.searchValue = '';
    this.setDisplayedLogins();
  }
}
