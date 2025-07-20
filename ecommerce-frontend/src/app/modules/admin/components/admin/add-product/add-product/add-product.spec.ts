import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPerfumeComponent } from './add-perfume';

describe('AddPerfumeComponent', () => {
  let component: AddPerfumeComponent;
  let fixture: ComponentFixture<AddPerfumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPerfumeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPerfumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
