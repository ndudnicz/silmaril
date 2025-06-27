import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMasterPasswordModalComponent } from './change-master-password-modal.component';

describe('ChangeMasterPasswordModalComponent', () => {
  let component: ChangeMasterPasswordModalComponent;
  let fixture: ComponentFixture<ChangeMasterPasswordModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeMasterPasswordModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeMasterPasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
