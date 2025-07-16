import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVaultModalComponent } from './edit-vault-modal.component';

describe('EditVaultModalComponent', () => {
  let component: EditVaultModalComponent;
  let fixture: ComponentFixture<EditVaultModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVaultModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditVaultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
