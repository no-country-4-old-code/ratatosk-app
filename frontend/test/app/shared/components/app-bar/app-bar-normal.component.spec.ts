import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppBarNormalComponent} from '@shared_comp/app-bar/app-bar-normal/app-bar-normal.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {MakeFirstLetterBigPipe} from '@app/shared/pipes/make-first-letter-big.pipe';

describe('AppBarNormalComponent', () => {
    let component: AppBarNormalComponent;
    let fixture: ComponentFixture<AppBarNormalComponent>;
    let debugDOM: DebugElement;
    const defaultValue = '';

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [AppBarNormalComponent, BasicBarComponent, MakeFirstLetterBigPipe],
            imports: [AngularMaterialImportModule]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppBarNormalComponent);
        component = fixture.componentInstance;
        debugDOM = fixture.debugElement;
        // fixture.detectChanges(); // <- bug when testing with OnPush-Detection. Only trigger once !
    });

    // --- function app

    it('function should emit given element', () => {
        // assign
        spyOn(component.clickOnGivenElement, 'emit');
        component.iconRightSecond = 'Miau';
        // act
        component.onClick('Miau');
        // assert
        expect(component.clickOnGivenElement.emit).toHaveBeenCalledTimes(1);
        expect(component.clickOnGivenElement.emit).toHaveBeenCalledWith('Miau');
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

    it('should have every attribute set to its default value', () => {
        // assert
        fixture.detectChanges();
        expect(component.title).toEqual(defaultValue);
        expect(component.iconLeft).toEqual(defaultValue);
        expect(component.iconRightFirst).toEqual(defaultValue);
        expect(component.iconRightSecond).toEqual(defaultValue);
    });

    it('should display-all the given title', () => {
        // act
        component.title = 'Miau';
        fixture.detectChanges();
        debugDOM = fixture.debugElement;
        const title = debugDOM.query(By.css('.title')).nativeElement;
        // assert
        expect(title.textContent).toEqual('Miau');
    });
});
