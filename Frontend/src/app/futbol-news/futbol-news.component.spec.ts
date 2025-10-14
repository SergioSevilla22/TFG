import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutbolNewsComponent } from './futbol-news.component';

describe('FutbolNewsComponent', () => {
  let component: FutbolNewsComponent;
  let fixture: ComponentFixture<FutbolNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FutbolNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FutbolNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
