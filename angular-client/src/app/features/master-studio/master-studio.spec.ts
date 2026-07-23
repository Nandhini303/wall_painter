import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterStudio } from './master-studio';

describe('MasterStudio', () => {
  let component: MasterStudio;
  let fixture: ComponentFixture<MasterStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterStudio],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterStudio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
