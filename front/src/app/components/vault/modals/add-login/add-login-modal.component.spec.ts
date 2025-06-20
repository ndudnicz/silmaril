import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoginModalComponent } from './add-login-modal.component';

describe('AddLoginComponent', () => {
  let component: AddLoginModalComponent;
  let fixture: ComponentFixture<AddLoginModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLoginModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
