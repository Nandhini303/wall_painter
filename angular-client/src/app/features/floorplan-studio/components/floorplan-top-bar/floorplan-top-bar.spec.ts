import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorplanTopBar } from './floorplan-top-bar';

describe('FloorplanTopBar', () => {
  let component: FloorplanTopBar;
  let fixture: ComponentFixture<FloorplanTopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorplanTopBar],
    }).compileComponents();

    fixture = TestBed.createComponent(FloorplanTopBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
