import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfumesComponent } from './perfumes';

describe('PerfumesComponent', () => {
  let component: PerfumesComponent;
  let fixture: ComponentFixture<PerfumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfumesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
