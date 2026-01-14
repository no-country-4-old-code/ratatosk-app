import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppBarReturnComponent} from '@shared_comp/app-bar/app-bar-return/app-bar-return.component';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {MakeFirstLetterBigPipe} from '@app/shared/pipes/make-first-letter-big.pipe';

describe('AppBarMenuComponent', () => {
    let component: AppBarReturnComponent;
    let fixture: ComponentFixture<AppBarReturnComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [AppBarReturnComponent, BasicBarComponent, MakeFirstLetterBigPipe],
            imports: [AngularMaterialImportModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppBarReturnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
