import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachPanelComponent } from './coach-panel.component';

describe('EntrenadorPanelComponent', () => {
  let component: CoachPanelComponent;
  let fixture: ComponentFixture<CoachPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
