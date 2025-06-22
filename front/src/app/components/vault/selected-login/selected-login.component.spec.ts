import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedLoginComponent } from './selected-login.component';

describe('SelectedLoginComponent', () => {
  let component: SelectedLoginComponent;
  let fixture: ComponentFixture<SelectedLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
