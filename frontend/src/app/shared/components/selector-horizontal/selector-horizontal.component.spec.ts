import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {SelectorHorizontalComponent} from './selector-horizontal.component';
import {getElement, getNumberOf, initTestUtils} from '@test/helper-frontend/dom/functions';


describe('SelectorHorizontalComponent', () => {
	let component: SelectorHorizontalComponent;
	let fixture: ComponentFixture<SelectorHorizontalComponent>;


	function getFirstElement() {
		return getElement('.element');
	}

	function getNumberOfElements() {
		return getNumberOf('.element');
	}

	function getNumberOfSelectedElements() {
		return getNumberOf('.color-accent-outlined');
	}


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectorHorizontalComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectorHorizontalComponent);
		initTestUtils(fixture);
		component = fixture.componentInstance;
	});

	describe('DOM', () => {
		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should display-all no options$ when no options$ given', () => {
			component.options$ = [];
			fixture.detectChanges();
			expect(getNumberOfElements()).toEqual(0);
		});

		it('should display-all ten options$ when ten options$ given', () => {
			const elements = Array(10);
			elements.fill('someValue', 0, 10);
			component.options$ = elements;
			fixture.detectChanges();
			expect(getNumberOfElements()).toEqual(10);
		});

		it('should display-all none element as selected from beginning as default (nothing configured)', () => {
			component.options$ = ['Miau', 'Yellow submarine'];
			fixture.detectChanges();
			expect(getNumberOfSelectedElements()).toEqual(0);
		});

		it('should display-all second element as selected from beginning when configured', () => {
			component.options$ = ['Miau', 'Yellow submarine'];
			component.selectedElement = component.options$[1];
			fixture.detectChanges();
			expect(getNumberOfSelectedElements()).toEqual(1);
		});

	});
	describe('Button', () => {
		it('should emit element text content when element clicked', () => {
			component.options$ = ['Yellow submarine', '2'];
			fixture.detectChanges();
			spyOn(component.onSelection, 'emit');
			// act
			getFirstElement().triggerEventHandler('click', {});
			// asert
			expect(component.onSelection.emit).toHaveBeenCalledTimes(1);
			expect(component.onSelection.emit).toHaveBeenCalledWith('Yellow submarine');
		});

		it('should display-all first element as selected when clicked', () => {
			component.options$ = ['Miau', 'Yellow submarine'];
			fixture.detectChanges();
			getFirstElement().triggerEventHandler('click', {});
			fixture.detectChanges();
			expect(getNumberOfSelectedElements()).toEqual(1);
		});

	});

});
