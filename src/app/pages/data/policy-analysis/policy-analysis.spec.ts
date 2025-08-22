import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAnalysisComponent } from './policy-analysis';

describe('PolicyAnalysisComponent', () => {
  let component: PolicyAnalysisComponent;
  let fixture: ComponentFixture<PolicyAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
