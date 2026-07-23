import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextureLibraryPanelComponent } from './texture-library-panel';

describe('TextureLibraryPanelComponent', () => {
  let component: TextureLibraryPanelComponent;
  let fixture: ComponentFixture<TextureLibraryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextureLibraryPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextureLibraryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
