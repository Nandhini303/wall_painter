import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorplanLeftPanel } from './floorplan-left-panel';

describe('FloorplanLeftPanel', () => {
  let component: FloorplanLeftPanel;
  let fixture: ComponentFixture<FloorplanLeftPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorplanLeftPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(FloorplanLeftPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
