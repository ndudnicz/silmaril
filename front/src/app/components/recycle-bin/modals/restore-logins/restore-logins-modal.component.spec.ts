import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreLoginsModalComponent } from './restore-logins-modal.component';

describe('RestoreLoginsModalComponent', () => {
  let component: RestoreLoginsModalComponent;
  let fixture: ComponentFixture<RestoreLoginsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreLoginsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreLoginsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
