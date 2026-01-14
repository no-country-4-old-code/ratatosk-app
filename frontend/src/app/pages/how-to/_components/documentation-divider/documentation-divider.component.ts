import {Component, Input, OnInit} from '@angular/core';
import {DocumentationDivider} from '@app/pages/how-to/_components/interfaces';

@Component({
    selector: 'app-documentation-divider',
    templateUrl: './documentation-divider.component.html',
    styleUrls: ['./documentation-divider.component.scss']
})
export class DocumentationDividerComponent implements OnInit {
    @Input() doc: DocumentationDivider;

    ngOnInit() {
    }
}

export function createDocDivider(partial: Omit<DocumentationDivider, 'component'>): DocumentationDivider {
    return {...partial, component: DocumentationDividerComponent};
}

