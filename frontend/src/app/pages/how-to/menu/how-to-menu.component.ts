import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {
    ActionListElementInputs
} from '@shared_comp/list-element/list-element-icon-and-text/list-element-icon-and-text.component';
import {materialIcons} from '@app/lib/global/icons';
import {ActivatedRoute, Router} from '@angular/router';
import {documentationFunctions} from '@app/pages/how-to/documentation/docs-functions';
import {documentationMetrics} from '@app/pages/how-to/documentation/docs-metrics';
import {documentationOther} from '@app/pages/how-to/documentation/docs-other';
import {DocumentationMultiple} from '@app/pages/how-to/_components/interfaces';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-how-to-menu',
    templateUrl: './how-to-menu.component.html',
    styleUrls: ['./how-to-menu.component.scss']
})
export class HowToMenuComponent implements OnInit {
    readonly pageTitle = 'Docs';
    readonly docs: ActionListElementInputs[] = [
        {
            icon: materialIcons.functions,
            title: 'Functions',
            subtext: 'Documentation of average, value, etc.',
            callback: () => this.navigateToDoc(documentationFunctions)
        },
        {
            icon: materialIcons.metrics,
            title: 'Metrics',
            subtext: 'Documentation of price, supply, etc.',
            callback: () => this.navigateToDoc(documentationMetrics)
        },
        {
            icon: materialIcons.other,
            title: 'Other',
            subtext: 'Other documentations',
            callback: () => this.navigateToDoc(documentationOther)
        },
    ];
    readonly faq: ActionListElementInputs = {
        icon: materialIcons.faq,
        title: 'Show FAQ',
        subtext: '',
        callback: () => this.navigateTo('faq')
    };

    constructor(private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
    }

    private navigateToDoc(doc: DocumentationMultiple<string>): void {
        this.navigateTo(`doc/${doc.header}`);
    }

    private navigateTo(path: string): void {
        this.router.navigate([path], {relativeTo: this.route});
    }
}
