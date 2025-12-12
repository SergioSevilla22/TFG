import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayersClubModalComponent } from './add-players-club-modal.component';

describe('AddPlayersClubModalComponent', () => {
  let component: AddPlayersClubModalComponent;
  let fixture: ComponentFixture<AddPlayersClubModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPlayersClubModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlayersClubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
