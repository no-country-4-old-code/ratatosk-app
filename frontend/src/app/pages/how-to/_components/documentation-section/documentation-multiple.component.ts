import {Component, Input, OnInit} from '@angular/core';
import {DocumentationMultiple} from '@app/pages/how-to/_components/interfaces';

@Component({
    selector: 'app-documentation-multiple',
    templateUrl: './documentation-multiple.component.html',
    styleUrls: ['./documentation-multiple.component.scss']
})
export class DocumentationMultipleComponent implements OnInit {
    @Input() doc: DocumentationMultiple<any | any[]>;
    isContentArrayOfElements: boolean;

    ngOnInit(): void {
        this.isContentArrayOfElements = this.doc.content && typeof this.doc.content !== 'string' && this.doc.content.length !== undefined;
    }
}

export function createDocSection<T>(partial: Omit<DocumentationMultiple<T>, 'component'>): DocumentationMultiple<T> {
    return {...partial, component: DocumentationMultipleComponent};
}
