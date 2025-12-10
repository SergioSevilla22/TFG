import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposClubComponent } from './equipos-club.component';

describe('EquiposClubComponent', () => {
  let component: EquiposClubComponent;
  let fixture: ComponentFixture<EquiposClubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposClubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
