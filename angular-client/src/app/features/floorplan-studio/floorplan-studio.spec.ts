import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorplanStudio } from './floorplan-studio';

describe('FloorplanStudio', () => {
  let component: FloorplanStudio;
  let fixture: ComponentFixture<FloorplanStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorplanStudio],
    }).compileComponents();

    fixture = TestBed.createComponent(FloorplanStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
