import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStacksComponent } from './card-stacks.component';

describe('CardStacksComponent', () => {
  let component: CardStacksComponent;
  let fixture: ComponentFixture<CardStacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardStacksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardStacksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
