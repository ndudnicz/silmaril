import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVaultModalComponent } from './add-vault-modal.component';

describe('AddVaultModalComponent', () => {
  let component: AddVaultModalComponent;
  let fixture: ComponentFixture<AddVaultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVaultModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVaultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
