import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallSelectionComponent } from './wall-selection.component';

describe('WallSelectionComponent', () => {
  let component: WallSelectionComponent;
  let fixture: ComponentFixture<WallSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WallSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WallSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
