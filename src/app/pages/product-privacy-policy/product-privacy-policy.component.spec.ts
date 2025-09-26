import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPrivacyPolicyComponent } from './product-privacy-policy.component';

describe('ProductPrivacyPolicyComponent', () => {
  let component: ProductPrivacyPolicyComponent;
  let fixture: ComponentFixture<ProductPrivacyPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPrivacyPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
