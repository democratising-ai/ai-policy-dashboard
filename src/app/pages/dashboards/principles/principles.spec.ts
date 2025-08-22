import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Principles } from './principles';

describe('Principles', () => {
  let component: Principles;
  let fixture: ComponentFixture<Principles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Principles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Principles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
