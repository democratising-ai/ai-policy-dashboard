import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPolicies } from './all-policies';

describe('AllPolicies', () => {
  let component: AllPolicies;
  let fixture: ComponentFixture<AllPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPolicies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPolicies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
