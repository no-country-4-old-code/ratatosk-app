import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {Location} from '@angular/common';
import {documentationFunctions} from '@app/pages/how-to/documentation/docs-functions';
import {EMPTY, Observable} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {DocumentationMultiple} from '@app/pages/how-to/_components/interfaces';
import {ActivatedRoute, Router} from '@angular/router';
import {documentationMetrics} from '@app/pages/how-to/documentation/docs-metrics';
import {documentationOther} from '@app/pages/how-to/documentation/docs-other';
import {throwErrorIfInvalid} from '@app/lib/util/error';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-doc-functions',
    templateUrl: './documentation.component.html',
    styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent {
    readonly iconBack = materialIcons.back;
    readonly doc$: Observable<DocumentationMultiple<any>>;
    private readonly blueprints = [documentationFunctions, documentationMetrics, documentationOther];

    constructor(public location: Location, private route: ActivatedRoute, private router: Router) {
        this.doc$ = this.getDoc$();
    }

    private getDoc$(): Observable<DocumentationMultiple<any>> {
        return this.route.paramMap.pipe(
            map(params => params.get('doc')),
            map(docName => this.blueprints.find(blue => blue.header === docName)),
            tap(blueprint => throwErrorIfInvalid(blueprint, 'Could not find documentation with given title')),
            catchError(error => this.handleParamError()),
        );
    }

    private handleParamError(): Observable<DocumentationMultiple<any>> {
        this.router.navigate(['/error']);
        return EMPTY;
    }
}
