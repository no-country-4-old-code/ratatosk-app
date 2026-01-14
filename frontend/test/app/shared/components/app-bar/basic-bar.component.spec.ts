import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {DebugElement} from '@angular/core';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';

describe('BasicBarComponent', () => {
    let component: BasicBarComponent;
    let fixture: ComponentFixture<BasicBarComponent>;
    let debugDOM: DebugElement;
    const defaultValue = '';
    const iconLeft = 'Miau';

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [BasicBarComponent],
            imports: [AngularMaterialImportModule]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BasicBarComponent);
        component = fixture.componentInstance;
        component.iconLeft = iconLeft;
        debugDOM = fixture.debugElement;
        // fixture.detectChanges(); // <- bug when testing with OnPush-Detection. Only trigger once !
    });

    // --- function app

    it('function should emit given empty  element', () => {
        // assign
        spyOn(component.clickOnGivenElement, 'emit');
        // act
        component.onClick(iconLeft);
        // assert
        expect(component.clickOnGivenElement.emit).toHaveBeenCalledTimes(1);
        expect(component.clickOnGivenElement.emit).toHaveBeenCalledWith(iconLeft);
        // alternative: component.clickOnGivenElement.subscribe((element: string) => expect(element).toBe('Miau'));
    });

    it('function should not emit when given element is equal default', () => {
        // assign
        spyOn(component.clickOnGivenElement, 'emit');
        // act
        component.onClick(defaultValue);
        // assert
        expect(component.clickOnGivenElement.emit).toHaveBeenCalledTimes(0);
    });

    // --- DOM app

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have every attribute set to its value', () => {
        // assert
        expect(component.iconLeft).toEqual(iconLeft);
        expect(component.iconRightFirst).toEqual(defaultValue);
        expect(component.iconRightSecond).toEqual(defaultValue);
    });
});
