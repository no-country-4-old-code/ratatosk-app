import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {searchEvaluationIntervalInMinutes} from '../../../../../../shared-library/src/scan/settings';
import {
    DocumentationMultiple,
    DocumentationSectionPanel,
    DocumentationSectionText
} from '@app/pages/how-to/_components/interfaces';
import {appInfo} from '@lib/global/app-info';
import {Location} from '@angular/common';
import {createDocSection} from '@app/pages/how-to/_components/documentation-section/documentation-multiple.component';
import {
    createDocSectionText
} from '@app/pages/how-to/_components/documentation-section-text/documentation-section-text.component';
import {
    createDocSectionPanel
} from '@app/pages/how-to/_components/documentation-section-panel/documentation-section-panel.component';
import {createDocDivider} from '@app/pages/how-to/_components/documentation-divider/documentation-divider.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-get-started-scan',
    templateUrl: './get-started-scan.component.html',
    styleUrls: ['./get-started-scan.component.scss']
})
export class GetStartedScanComponent {
    readonly title = 'Get started';
    readonly iconBack = materialIcons.back;
    readonly iconView = materialIcons.views;
    readonly documentations: DocumentationMultiple<any>[] = [
        createDocSectionText({
            header: '1) Add a filter',
            content: 'Click on the "add" button on the main page to add a new filter.',
        }),
        createDocSection({
            header: '2) Specify filter behaviour in three steps',
            content: this.getDocumentationSteps(),
        }),
        createDocSectionText({
            header: 'Any questions left ?',
            content: `Ask us via twitter using ${appInfo.tagsQuestion.bold()}`
        })
    ];

    constructor(public location: Location) {
    }

    // private

    private getDocumentationSteps(): DocumentationSectionPanel<DocumentationSectionText[]>[] {
        return [
            {
                panelState: false,
                isOnlyForPro: false,
                header: 'Filter',
                content: [
                    createDocSectionText({
                        header: 'What could I specify here ?',
                        content: 'Your filter considers all supported cryptocurrcies by default.' +
                            '\n\nIf you want to analyse only a specfic subset, you could specify it here.'
                    }),
                    createDocDivider({
                        header: 'Examples',
                    }),
                    createDocSectionText({
                        header: 'all coins',
                        content: `${appInfo.name} analyse all coins for this filter (default).`
                    }),
                    createDocSectionText({

                        header: 'btc, eth',
                        content: `${appInfo.name} only analyse Bitcoin (BTC) and Ethereum (ETH).` +
                            '\nE.g. even if XRP would match all of the conditions, it will be ignored.'
                    }),
                ]
            },
            {
                panelState: false,
                isOnlyForPro: false,
                header: 'based on',
                content: [
                    createDocSectionText({
                        header: 'What could I specify here ?',
                        content: 'Your filter selects coins based on your individually conditions.' +
                            '\n\nYou define your conditions in this dialog'
                    }),
                    createDocDivider({
                        header: 'Examples',
                    }),
                    createDocSectionText({

                        header: 'value >= 1.015 * min(1H)',
                        content: 'Get all coins which increase at least 1,5 % within the last hour.'
                    }),
                    createDocSectionText({

                        header: 'average(8W) >= average(30W)',
                        content: 'Get all coins which have a short term average greater then their long term average.' +
                            ' SMA crossing SMA is a common trading signal.'
                    }),
                    createDocSectionText({

                        header: 'Want more ?',
                        content: `Visit our function documentation section to see more examples.`
                    }),
                ]
            },
            {
                panelState: false,
                isOnlyForPro: false,
                header: 'Notify',
                content: [
                    createDocSectionText({
                        header: 'What could I specify here ?',
                        content: `Every filter is recalculated every ${searchEvaluationIntervalInMinutes} minutes even when your app is closed to make sure you never miss a opportunity.` +
                            '\n\nSpecify here if you want to be notified.' +
                            '\n\nThis service is only executed for pro users.'
                    }),
                    createDocDivider({
                        header: 'Examples',
                    }),
                    createDocSectionText({
                        header: 'enabled',
                        content: 'You will be notified whenever a new coin "enter" the filter result.' +
                            '\nE.g. The last reported filter result contains Bitcoin and Ethereum.' +
                            ' The new filter result contains Bitcoin, Ethereum and XRP.'
                    }),
                    createDocSectionText({
                        header: 'disabled',
                        content: 'You will never be notified by this scan.'
                    }),
                ]
            },
        ].map(createDocSectionPanel);
    }

}
