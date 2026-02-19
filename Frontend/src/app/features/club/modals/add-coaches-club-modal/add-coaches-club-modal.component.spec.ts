import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoachesClubModalComponent } from './add-coaches-club-modal.component';

describe('AddCoachesClubModalComponent', () => {
  let component: AddCoachesClubModalComponent;
  let fixture: ComponentFixture<AddCoachesClubModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoachesClubModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCoachesClubModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
