import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EssentialReading } from './essential-reading';

describe('EssentialReading', () => {
  let component: EssentialReading;
  let fixture: ComponentFixture<EssentialReading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EssentialReading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EssentialReading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
