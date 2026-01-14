import {
    DocumentationMultiple,
    DocumentationSectionPanel,
    DocumentationSectionText
} from '@app/pages/how-to/_components/interfaces';
import {freeOptionsMetric} from '@app/lib/user-role/options/options';
import {appInfo} from '@app/lib/global/app-info';
import {lookupMetricInfo} from '@app/lib/coin/lookup-metric-info';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {MetricHistory} from '../../../../../../shared-library/src/datatypes/data';
import {
    createDocSectionText
} from '@app/pages/how-to/_components/documentation-section-text/documentation-section-text.component';
import {
    createDocSectionPanel
} from '@app/pages/how-to/_components/documentation-section-panel/documentation-section-panel.component';
import {createDocSection} from '@app/pages/how-to/_components/documentation-section/documentation-multiple.component';

type LookupMetric2String = { [func in MetricHistory<'coin'>]: string };
const lookupWhyToUse = getLookupMetric2WhyUseIt();

export const documentationMetrics: DocumentationMultiple<any> = createDocSection(
    {
        header: 'metrics',
        content: [
            createDocSection({header: '', content: assetCoin.getMetricsHistory().map(attr => createDoc(attr))}),
            createDocSectionText({header: `If you miss something here please make a feature request via twitter using ${appInfo.tagsFeatureRequest.bold()}`})
        ]
    }
);

// private

function createDoc(metric: MetricHistory<'coin'>): DocumentationSectionPanel<DocumentationSectionText[]> {
    const doc = {
        header: metric,
        isOnlyForPro: !(freeOptionsMetric.includes(metric)),
        content: buildDescriptions(metric),
        panelState: false
    };
    return createDocSectionPanel(doc);
}

function buildDescriptions(metric: MetricHistory<'coin'>): DocumentationSectionText[] {
    return [
        {header: 'What does it represent ?', content: lookupMetricInfo[metric]},
        {header: 'Why should I use it ?', content: lookupWhyToUse[metric]}
    ].map(createDocSectionText);
}

function getLookupMetric2WhyUseIt(): LookupMetric2String {
    return {
        price: 'The value of a coin is the meeting point between what people are willing to sell for it and' +
            ' what people are willing to pay for it.',
        rank: 'The rank shows the own market cap relative to the market cap of other coins.' +
            ' Changes in the rank could indicate changes in the relative popularity.',
        supply: 'The value of cryptocurrency at any time is completely governed by supply and demand.' +
            ' If the supply is greater than the demand the price will suffer and via versa.' +
            ' Circulating supply is the number of coins available at any moment, i.e. it is the ‘supply’.' +
            ' Trends of the circulating supply could indicate coming price changes or corrections.',
        volume: 'The volume underscores how many people are buying and selling the coin.' +
            '\nE.g. If a price change of Bitcoin comes hand in hand with a hefty volume it indicates that a lot of people' +
            ' making moves and believe that the current change last longer.',
        marketCap: 'Changes in the market cap could indicate changes in popularity.' +
            '\nThe further meaning of market cap is disputed.' +
            ' Opinions go from "The market cap of a coin is strongly bounded to the value of the currency itself" to' +
            ' "The market cap is only a mathematical indicator without real world meaning".',
        redditScore: 'The number of reddit talks could indicate upcoming changes.' +
            '\nPlease be aware that more popularity on reddit not necessarily comes hand in hand with "good" news.',
        rsi: 'The relative strength index (RSI) measures the magnitude of recent price changes and oszilates between 0 and 100.' +
            ' Following the traditional interpretation a RSI above 70 indicates that an asset is becoming overbought or overvalued and may be primed for a trend reversal.' +
            ' An RSI of 30 or below indicates an oversold or undervalued condition.'
    };
}
