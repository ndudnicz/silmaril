import { Component, inject, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from '../base-component/base-component.component';
import { MatIconModule } from '@angular/material/icon';
import { Login } from '../../entities/login';
import { Subscription, take } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CardStacksComponent } from '../card-stacks/card-stacks.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModalComponent } from '../modals/confirm-modal/confirm-modal.component';

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
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './recycle-bin.component.html',
  styleUrl: './recycle-bin.component.css'
})
export class RecycleBinComponent extends BaseComponent implements OnInit {

  searchValue: string = '';
  searchBarPlaceholder = 'Search in Recycle Bin';
  allDeletedLogins: Login[] = [];
  displayedLogins: Login[] = [];
  selectedLogins: Login[] = [];
  subscription: Subscription = new Subscription();
  unselectAllTrigger: number = 0;

  constructor(
    private dataService: DataService,
    private loginService: LoginService,
    private dialog: MatDialog
  ) {
    super(inject(NgxSpinnerService));
  }

  ngOnInit(): void {
    this.startLoading();
    this.setupSubscriptions();
    this.allDeletedLogins = this.dataService.getRecycleBinLogins() ?? [];
    console.log('recycle bin ngoninit', this.allDeletedLogins);
    this.setDisplayedLogins();
    this.stopLoading();
  }

  setupSubscriptions() {
  }

  setDisplayedLogins() {
    if (this.allDeletedLogins) {
      this.displayedLogins = this.allDeletedLogins.filter(login => login.deleted);
    } else {
      this.displayedLogins = [];
    }
  }

  select(login: Login): void {
    if (this.selectedLogins.includes(login)) {
      this.selectedLogins = this.selectedLogins.filter(l => l !== login);
      console.log(`Login deselected`, login);
      return;
    } else {
      this.selectedLogins.push(login);
    }
  }

  restoreSelectedLogins(): void {
    console.log(`Restoring logins `, this.selectedLogins);
  }

  confirmDeleteSelectedLogins(): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        title: 'Confirm Permanent Deletion',
        message: `Are you sure you want to permanently delete ${this.selectedLogins.length} logins? This action cannot be undone.`,
        confirmText: 'Permanently Delete',
        cancelText: 'Cancel'
      },
      panelClass: 'custom-modal'
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.proceedDeleteSelectedLogins();
      } else {
        console.log('Permanent deletion cancelled');
      }
    });
  }

  proceedDeleteSelectedLogins(): void {
    this.startLoading();
    console.log(`Permanently deleting logins `, this.selectedLogins);
    this.loginService.deleteLogins$({ ids: this.selectedLogins.map(login => login.id) }).pipe(take(1)).subscribe({
      next: (deletedCount: number) => {
        this.onSuccededDeleteLogins(deletedCount);
      },
      error: (error: any) => {
        this.stopLoading();
        console.error('Error permanently deleting logins:', error);
        this.displayError('Failed to permanently delete logins', error);
      }
    });
  }

  onSuccededDeleteLogins(deletedCount: number): void {
    console.log(`Permanently deleted ${deletedCount} logins`);
    this.allDeletedLogins = this.allDeletedLogins.filter(login => !this.selectedLogins.includes(login));
    this.setDisplayedLogins();
    this.selectedLogins = [];
    this.stopLoading();
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

  clearSelection() {
    this.unselectAllTrigger++;
    this.selectedLogins = [];
    console.log('Selection cleared');
  }
}
