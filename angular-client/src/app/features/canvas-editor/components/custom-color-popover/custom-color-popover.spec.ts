import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomColorPopover } from './custom-color-popover';

describe('CustomColorPopover', () => {
  let component: CustomColorPopover;
  let fixture: ComponentFixture<CustomColorPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomColorPopover],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomColorPopover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
