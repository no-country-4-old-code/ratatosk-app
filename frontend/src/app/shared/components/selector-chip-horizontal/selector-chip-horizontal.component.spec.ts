import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectorChipHorizontalComponent} from './selector-chip-horizontal.component';

describe('SelectorChipHorizontalComponent', () => {
	let component: SelectorChipHorizontalComponent;
	let fixture: ComponentFixture<SelectorChipHorizontalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectorChipHorizontalComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectorChipHorizontalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
