import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernancePractices } from './governance-practices';

describe('GovernancePractices', () => {
  let component: GovernancePractices;
  let fixture: ComponentFixture<GovernancePractices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernancePractices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GovernancePractices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
