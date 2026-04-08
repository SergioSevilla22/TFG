import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubTeamsComponent } from './club-teams.component';

describe('EquiposClubComponent', () => {
  let component: ClubTeamsComponent;
  let fixture: ComponentFixture<ClubTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubTeamsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
