import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLoginModalComponent } from './add-edit-login-modal.component';

describe('AddLoginComponent', () => {
  let component: AddEditLoginModalComponent;
  let fixture: ComponentFixture<AddEditLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditLoginModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
