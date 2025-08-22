import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationYear } from './creation-year';

describe('CreationYear', () => {
  let component: CreationYear;
  let fixture: ComponentFixture<CreationYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationYear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationYear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
