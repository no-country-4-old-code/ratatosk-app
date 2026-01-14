import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DocumentationSectionPanel, DocumentationSectionText} from '@app/pages/how-to/_components/interfaces';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-documentation-section-panel',
    templateUrl: './documentation-section-panel.component.html',
    styleUrls: ['./documentation-section-panel.component.scss']
})
export class DocumentationSectionPanelComponent {
    @Input() doc: DocumentationSectionPanel<DocumentationSectionText[]>;
}

export function createDocSectionPanel<T>(partial: Omit<DocumentationSectionPanel<T>, 'component'>): DocumentationSectionPanel<T> {
    return {...partial, component: DocumentationSectionPanelComponent};
}