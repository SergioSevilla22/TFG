import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCoachTeamModalComponent } from './assign-coach-team-modal.component';

describe('AssignCoachTeamModalComponent', () => {
  let component: AssignCoachTeamModalComponent;
  let fixture: ComponentFixture<AssignCoachTeamModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCoachTeamModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignCoachTeamModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
