import {Component, Input, OnInit} from '@angular/core';
import {DocumentationSectionText} from '@app/pages/how-to/_components/interfaces';

@Component({
    selector: 'app-documentation-section-icon',
    templateUrl: './documentation-section-text.component.html',
    styleUrls: ['./documentation-section-text.component.scss']
})
export class DocumentationSectionTextComponent implements OnInit {
    @Input() doc: DocumentationSectionText;

    ngOnInit() {
    }
}

export function createDocSectionText(partial: Omit<DocumentationSectionText, 'component'>): DocumentationSectionText {
    return {...partial, component: DocumentationSectionTextComponent};
}
