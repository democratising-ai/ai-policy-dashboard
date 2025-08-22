import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupTables } from './lookup-tables';

describe('LookupTables', () => {
  let component: LookupTables;
  let fixture: ComponentFixture<LookupTables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupTables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupTables);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
