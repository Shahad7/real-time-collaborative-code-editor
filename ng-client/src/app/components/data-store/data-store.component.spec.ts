import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStoreComponent } from './data-store.component';

describe('DataStoreComponent', () => {
  let component: DataStoreComponent;
  let fixture: ComponentFixture<DataStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataStoreComponent]
    });
    fixture = TestBed.createComponent(DataStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
