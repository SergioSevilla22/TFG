import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenadorPanelComponent } from './entrenador-panel.component';

describe('EntrenadorPanelComponent', () => {
  let component: EntrenadorPanelComponent;
  let fixture: ComponentFixture<EntrenadorPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenadorPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntrenadorPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
