import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityRisk } from './opportunity-risk';

describe('OpportunityRisk', () => {
  let component: OpportunityRisk;
  let fixture: ComponentFixture<OpportunityRisk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityRisk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityRisk);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
