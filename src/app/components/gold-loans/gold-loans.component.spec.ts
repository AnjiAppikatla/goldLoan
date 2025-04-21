import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldLoansComponent } from './gold-loans.component';

describe('GoldLoansComponent', () => {
  let component: GoldLoansComponent;
  let fixture: ComponentFixture<GoldLoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldLoansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoldLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
