import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayersTeamModalComponent } from './add-players-team-modal.component';

describe('AddPlayersTeamModalComponent', () => {
  let component: AddPlayersTeamModalComponent;
  let fixture: ComponentFixture<AddPlayersTeamModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlayersTeamModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlayersTeamModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
