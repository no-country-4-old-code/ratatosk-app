import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {appInfo} from '@app/lib/global/app-info';
import {lookupCoinInfo} from '../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {
    DocumentationMultiple,
    DocumentationSectionPanel,
    DocumentationSectionText
} from '@app/pages/how-to/_components/interfaces';
import {Location} from '@angular/common';
import {createDocSection} from '@app/pages/how-to/_components/documentation-section/documentation-multiple.component';
import {
    createDocSectionText
} from '@app/pages/how-to/_components/documentation-section-text/documentation-section-text.component';
import {
    createDocSectionPanel
} from '@app/pages/how-to/_components/documentation-section-panel/documentation-section-panel.component';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
    readonly title = 'FAQs';
    readonly iconBack = materialIcons.back;
    readonly doc: DocumentationMultiple<any> = createDocSection({
        header: '',
        content: [
            createDocSection({header: '', content: this.getQuestions()}),
            createDocSectionText({header: `Your question is not listed yet?\nAsk us via twitter using ${appInfo.tagsQuestion.bold()}`})
        ]
    });

    constructor(public location: Location) {
    }

    // private

    private getQuestions(): DocumentationSectionPanel<DocumentationSectionText[]>[] {
        return [
            this.createQuestion('which coins are supported ?',
                [
                    {
                        header: 'How many coins are supported ?',
                        content: `Actually ${assetCoin.getIds().length} coins are supported.`
                    },
                    {
                        header: 'Which coins are supported ?',
                        content: `${this.getSupportedCoins()}`
                    },

                ]),
            this.createQuestion(`how do I add ${appInfo.name} to my home screen ?`,
                [
                    {
                        header: 'On Android',
                        content: `Simply visit the website <a class="font-colored" href="${appInfo.url}">${appInfo.url}</a> with the chrome browser and a native app install banner should pop up.` +
                            'If chrome does not show the install banner we recommend to clear the browser cache and try again.\n\n'
                    },
                    {
                        header: 'On IOS',
                        content: 'It is not supported yet but also planned.'
                    }
                ]),
            this.createQuestion('which impact has quantization ?',
                [
                    {
                        header: 'Why do we use quantizied values ?',
                        content: `${appInfo.name} has a sampling period of 5 minutes.` +
                            ' Using this high resolution for the calculation of functions which cover a long time (like average(3M))' +
                            ' results in a huge loss of performance for an in most cases negligible gain of precision.' +
                            ' Therefore, samples with combined resolutions are used for function with greater scope.'
                    },
                    {
                        header: 'Is the loss of precision always negligible ?',
                        content: 'There are cases where the loss of precision is not negligible.' +
                            ' The min/max-functions are expected to check every value.' +
                            ' But as the samples growing older, they are getting more smoothed.' +
                            '\n\nAlthough this deviation is not negligible, it is practical preferable (in the present scale).' +
                            ' It increases the impact of older maximums according to their duration.'
                    }
                ])
        ];
    }

    private createQuestion(question: string, answers: Partial<DocumentationSectionText>[]): DocumentationSectionPanel<DocumentationSectionText[]> {
        return createDocSectionPanel({
            header: question,
            content: answers.map(createDocSectionText),
            panelState: false,
            isOnlyForPro: false
        });
    }

    private getSupportedCoins(): string {
        const coins = assetCoin.getIds().map(id => `${lookupCoinInfo[id].name} (${lookupCoinInfo[id].symbol})`);
        return coins.join('\n');
    }
}

/*
Please note, that a function always  with scope
Maximum age of sample  |  resolution
------------------------------------
        24 hours       |    5 minutes
         1 week        |    1 hour
         1 month       |    6 hours
         3 month       |    1 day
         1 year        |    1 week
         5 years       |    2 weeks

 */