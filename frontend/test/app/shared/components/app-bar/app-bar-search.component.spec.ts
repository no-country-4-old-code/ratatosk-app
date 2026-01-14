import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppBarSearchComponent} from '@shared_comp/app-bar/app-bar-search/app-bar-search.component';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {getElement, initTestUtils} from '@test/helper-frontend/dom/functions';
import {SearchComponent} from '@shared_comp/search/search.component';
import {materialIcons} from '@app/lib/global/icons';
import {MakeFirstLetterBigPipe} from '@app/shared/pipes/make-first-letter-big.pipe';


describe('AppBarSearchComponent', () => {
    let component: AppBarSearchComponent;
    let fixture: ComponentFixture<AppBarSearchComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, AngularMaterialImportModule],
            declarations: [AppBarSearchComponent, BasicBarComponent, SearchComponent, MakeFirstLetterBigPipe]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppBarSearchComponent);
        initTestUtils(fixture);
        component = fixture.componentInstance;
    });

    function getInputForm() {
        return getElement('input');
    }

    function getCleanButton() {
        return getElement('.x-flex-element-right');
    }

    describe('DOM', () => {
        it('should create', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });

        it('should display-all arrow, input and no clean button at the beginning', () => {
            fixture.detectChanges();
            // assert
            expect(getInputForm()).toBeTruthy();
            expect(getCleanButton()).toBeNull();
        });

        xit('should display-all arrow, input and clean button after a searchTerm was entered', () => {
            component.searchTermControl.setValue('mioou');
            fixture.detectChanges();
            // assert
            expect(getInputForm()).toBeTruthy();
            expect(getCleanButton()).toBeTruthy();
        });

    });

    xdescribe('Search', () => {
        // TODO: use for search component
        it('should emit searchTerm when keyUp-Event is triggered', () => {
            // assign
            const searchTerm = 'miauMiau';
            spyOn(component.keyUpSearch, 'emit');
            spyOn(component.clickOnReturn, 'emit');
            // act
            fixture.detectChanges();
            component.searchTermControl.setValue(searchTerm);
            getInputForm().triggerEventHandler('keyup', {target: {value: searchTerm}});
            // assert
            expect(component.clickOnReturn.emit).toHaveBeenCalledTimes(0);
            expect(component.keyUpSearch.emit).toHaveBeenCalledTimes(1);
            expect(component.keyUpSearch.emit).toHaveBeenCalledWith(searchTerm);
        });

        it('should emit empty search term when clean button is clicked', () => {
            // assign
            component.searchTermControl.setValue('miauMiau');
            spyOn(component.keyUpSearch, 'emit');
            // act
            fixture.detectChanges();
            getCleanButton().triggerEventHandler('click');
            // assert
            expect(component.keyUpSearch.emit).toHaveBeenCalledTimes(1);
            expect(component.keyUpSearch.emit).toHaveBeenCalledWith('');
            expect(component.searchTermControl.value).toBe('');
        });

        it('should emit empty search term when return button is clicked', () => {
            // assign
            component.searchTermControl.setValue('miauMiau');
            spyOn(component.keyUpSearch, 'emit');
            // act
            fixture.detectChanges();
            getElement('app-basic-bar').triggerEventHandler('clickOnGivenElement', materialIcons.back);
            // assert
            expect(component.keyUpSearch.emit).toHaveBeenCalledTimes(1);
            expect(component.keyUpSearch.emit).toHaveBeenCalledWith('');
            expect(component.searchTermControl.value).toBe('');
        });

        it('should not emit empty search term when other icon button from app-basic-bar is clicked', () => {
            // assign
            const searchTerm = 'miauMiau';
            component.searchTermControl.setValue(searchTerm);
            spyOn(component.keyUpSearch, 'emit');
            spyOn(component.clickOnReturn, 'emit');
            // act
            fixture.detectChanges();
            getElement('app-basic-bar').triggerEventHandler('clickOnGivenElement', materialIcons.back + 'ups');
            // assert
            expect(component.clickOnReturn.emit).toHaveBeenCalledTimes(0);
            expect(component.keyUpSearch.emit).toHaveBeenCalledTimes(0);
            expect(component.searchTermControl.value).toBe(searchTerm);
        });

    });

});
