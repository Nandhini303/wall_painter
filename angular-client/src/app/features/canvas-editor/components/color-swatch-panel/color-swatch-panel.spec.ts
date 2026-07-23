import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSwatchPanelComponent } from './color-swatch-panel';

describe('ColorSwatchPanelComponent', () => {
  let component: ColorSwatchPanelComponent;
  let fixture: ComponentFixture<ColorSwatchPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSwatchPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorSwatchPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
