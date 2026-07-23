import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomColorPopoverComponent } from './custom-color-popover';

describe('CustomColorPopoverComponent', () => {
  let component: CustomColorPopoverComponent;
  let fixture: ComponentFixture<CustomColorPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomColorPopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomColorPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
