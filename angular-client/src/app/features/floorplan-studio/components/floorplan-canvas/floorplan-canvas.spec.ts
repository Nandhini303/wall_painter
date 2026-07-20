import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorplanCanvas } from './floorplan-canvas';

describe('FloorplanCanvas', () => {
  let component: FloorplanCanvas;
  let fixture: ComponentFixture<FloorplanCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorplanCanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(FloorplanCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
