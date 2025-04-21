import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalloansComponent } from './personalloans.component';

describe('PersonalloansComponent', () => {
  let component: PersonalloansComponent;
  let fixture: ComponentFixture<PersonalloansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalloansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalloansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
