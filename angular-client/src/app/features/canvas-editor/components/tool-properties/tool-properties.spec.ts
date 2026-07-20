import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolProperties } from './tool-properties';

describe('ToolProperties', () => {
  let component: ToolProperties;
  let fixture: ComponentFixture<ToolProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolProperties],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolProperties);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
