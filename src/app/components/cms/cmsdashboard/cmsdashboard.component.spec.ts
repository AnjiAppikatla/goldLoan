import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsdashboardComponent } from './cmsdashboard.component';

describe('CmsdashboardComponent', () => {
  let component: CmsdashboardComponent;
  let fixture: ComponentFixture<CmsdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsdashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CmsdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
