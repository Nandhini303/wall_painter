import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextureLibraryPanel } from './texture-library-panel';

describe('TextureLibraryPanel', () => {
  let component: TextureLibraryPanel;
  let fixture: ComponentFixture<TextureLibraryPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextureLibraryPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(TextureLibraryPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
