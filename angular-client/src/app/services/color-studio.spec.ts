import { TestBed } from '@angular/core/testing';

import { ColorStudio } from './color-studio';

describe('ColorStudio', () => {
  let service: ColorStudio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorStudio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
