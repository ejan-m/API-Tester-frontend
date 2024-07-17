import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApiFormComponent } from './add-api-form.component';

describe('AddApiFormComponent', () => {
  let component: AddApiFormComponent;
  let fixture: ComponentFixture<AddApiFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddApiFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddApiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
