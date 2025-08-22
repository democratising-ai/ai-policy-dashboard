import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAComponent } from './all-potentially-relevant-ai-policies-reviewed';

describe('TableAComponent', () => {
  let component: TableAComponent;
  let fixture: ComponentFixture<TableAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
