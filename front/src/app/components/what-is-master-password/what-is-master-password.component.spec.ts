import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatIsMasterPasswordComponent } from './what-is-master-password.component';

describe('WhatIsMasterPasswordComponent', () => {
  let component: WhatIsMasterPasswordComponent;
  let fixture: ComponentFixture<WhatIsMasterPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatIsMasterPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatIsMasterPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
