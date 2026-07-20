import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSwatchPanel } from './color-swatch-panel';

describe('ColorSwatchPanel', () => {
  let component: ColorSwatchPanel;
  let fixture: ComponentFixture<ColorSwatchPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSwatchPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorSwatchPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
