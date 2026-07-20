import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallInspectorPanel } from './wall-inspector-panel';

describe('WallInspectorPanel', () => {
  let component: WallInspectorPanel;
  let fixture: ComponentFixture<WallInspectorPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WallInspectorPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(WallInspectorPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
