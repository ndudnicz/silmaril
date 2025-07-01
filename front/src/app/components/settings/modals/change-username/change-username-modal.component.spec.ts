import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUsernameModalComponent } from './change-username-modal.component';

describe('ChangeUsernameModalComponent', () => {
  let component: ChangeUsernameModalComponent;
  let fixture: ComponentFixture<ChangeUsernameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeUsernameModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeUsernameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
