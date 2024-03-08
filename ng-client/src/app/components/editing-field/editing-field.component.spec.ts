import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingFieldComponent } from './editing-field.component';

describe('EditingFieldComponent', () => {
  let component: EditingFieldComponent;
  let fixture: ComponentFixture<EditingFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditingFieldComponent]
    });
    fixture = TestBed.createComponent(EditingFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
