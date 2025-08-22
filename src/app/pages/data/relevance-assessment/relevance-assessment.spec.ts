import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevanceAssessment } from './relevance-assessment';

describe('RelevanceAssessment', () => {
  let component: RelevanceAssessment;
  let fixture: ComponentFixture<RelevanceAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelevanceAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelevanceAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
