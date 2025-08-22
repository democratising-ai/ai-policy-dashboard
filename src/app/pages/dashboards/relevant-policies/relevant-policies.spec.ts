import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevantPolicies } from './relevant-policies';

describe('RelevantPolicies', () => {
  let component: RelevantPolicies;
  let fixture: ComponentFixture<RelevantPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelevantPolicies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelevantPolicies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
