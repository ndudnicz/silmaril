import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePasswordModalComponent } from './generate-password-modal.component';

describe('GeneratePasswordModalComponent', () => {
  let component: GeneratePasswordModalComponent;
  let fixture: ComponentFixture<GeneratePasswordModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePasswordModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratePasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
