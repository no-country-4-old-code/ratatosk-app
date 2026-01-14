import {appInfo} from '@app/lib/global/app-info';
import {getFunctionOptions} from '../../../../../../shared-library/src/scan/indicator-functions/lookup-functions';
import {
    DocumentationMultiple,
    DocumentationSectionPanel,
    DocumentationSectionText
} from '@app/pages/how-to/_components/interfaces';
import {freeOptionsFunction} from '@app/lib/user-role/options/options';
import {lookupFunctionInfo} from '@app/lib/indicator-functions/lookupFunctionInfo';
import {getInfoOfFunction} from '../../../../../../shared-library/src/scan/indicator-functions/info';
import {lookupParamInfo} from '@app/lib/indicator-functions/lookupParamInfo';
import {FunctionOption} from '../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {
    createDocSectionText
} from '@app/pages/how-to/_components/documentation-section-text/documentation-section-text.component';
import {createDocSection} from '@app/pages/how-to/_components/documentation-section/documentation-multiple.component';
import {
    createDocSectionPanel
} from '@app/pages/how-to/_components/documentation-section-panel/documentation-section-panel.component';
import {createDocDivider} from '@app/pages/how-to/_components/documentation-divider/documentation-divider.component';

type LookupFunction2String = { [func in FunctionOption]: string };
type LookupFunction2Sections = { [func in FunctionOption]: Omit<DocumentationSectionText, 'component'>[] };

const lookupInfo = getLookupFunctions2ExtraInfo();
const lookupWhyToUse = getLookupFunctions2WhyUseIt();
const lookupExamples = getLookupFunctions2Examples();

export const documentationFunctions: DocumentationMultiple<any> = createDocSection({
        header: 'functions',
        content: [
            createDocSection({header: '', content: getFunctionOptions().map(attr => createDoc(attr))}),
            createDocSectionText({header: `If you miss something here please make a feature request via twitter using ${appInfo.tagsFeatureRequest.bold()}`})
        ]
    }
);

// private

function createDoc(func: FunctionOption): DocumentationSectionPanel<DocumentationSectionText[]> {
    return createDocSectionPanel({
        header: func,
        isOnlyForPro: !(freeOptionsFunction.includes(func)),
        content: createDescriptions(func),
        panelState: false,
        supportedParams: getInfoOfFunction(func).supportedParams.map(param => createDocSection({
            header: param,
            content: lookupParamInfo[param]
        }))
    });
}

function createDescriptions(func: FunctionOption): DocumentationSectionText[] {
    return [
        createDocSectionText({
            header: 'What does it do for me?',
            content: 'This function returns ' + lookupFunctionInfo[func]
        }),
        createDocSectionText({
            header: 'Why should I use it ?',
            content: lookupWhyToUse[func]
        }),
        createDocDivider({
            header: 'Examples',
        }),
        ...lookupExamples[func].map(createDocSectionText),
        ...lookupInfo[func].map(createDocSectionText)
    ];
}

function createExtraInfo(): DocumentationSectionText[] {
    return [
        {
            header: 'Info',
            content: 'For scopes greater 24 hours every considered sample is smoothed according to our sampling concept.' +
                ' The practical impact is negligible. Further information can be found in the FAQ-section under "Which impact has quantization ?"'
        },
    ].map(createDocSectionText);
}

function getLookupFunctions2ExtraInfo(): LookupFunction2Sections {
    return {
        threshold: [],
        value: [],
        average: [],
        pastValue: createExtraInfo(),
        min: createExtraInfo(),
        max: createExtraInfo(),
        deviation: createExtraInfo(),
    };
}

function getLookupFunctions2WhyUseIt(): LookupFunction2String {
    return {
        threshold: 'To get an static reference value of your choice.',
        value: 'To get the unmodified, current value.',
        average: 'E.g. to determine the trend direction. The SMA is often used in technical indicators.',
        pastValue: 'To detect trends and developments from the past to now.' +
            ' Please be aware that the value of one specific sample in the past might fluctuate greatly over time.' +
            ' We recommend to use average, min, max or deviation for more stability.',
        min: 'To create an lower channel line which enables you to e.g. evaluate the min-max spread.',
        max: 'To create an upper channel line which enables you to e.g. evaluate the min-max spread.',
        deviation: 'To create an deviation channel line which enables you to e.g. detect trend changing events.'
    };
}

function getLookupFunctions2Examples(): LookupFunction2Sections {
    return {
        threshold: [
            {
                header: 'value < threshold(42)',
                content: 'Get all coins which have a rank smaller 42 (if used on metric "rank").'
            },
        ],
        value: [
            {
                header: 'value <= 0.99 * average(30W)',
                content: 'Get all coins which drop under 99 % of the long term trend.' +
                    ' You might want to go short or exit long.'
            },
            {
                header: 'value >= 1.015 * pastValue(1H)',
                content: 'Get all coins which increase at least 1,5 % within the last hour.'
            },
        ],
        average: [
            {
                header: 'average(8W) >= average(30W)',
                content: 'Get all coins which have a short term average greater then their long term average.' +
                    ' SMA crossing SMA is a common trading signal.'
            },
            {
                header: 'value <= 0.99 * average(30W)',
                content: 'Get all coins which drop under 99 % of the long term trend.' +
                    ' You might want to go short or exit long.'
            },
            {
                header: 'min(1H) >= average(30W)',
                content: 'Get all coins which stays for at least one hour over the long term trend.' +
                    ' You might want to go long or cover short.'
            },
        ],
        pastValue: [
            {
                header: 'value >= 1.015 * pastValue(1H)',
                content: 'Get all coins which increase at least 1,5 % within the last hour.'
            },
            {
                header: 'min(1H) >= pastValue(1W)',
                content: 'Get all coins which have a minimum within the last hour greater then the value one week ago.'
            },
        ],
        min: [
            {
                header: 'max(1H) >= 1.05 * min(1H)',
                content: 'Get all coins which have a min-max spread of at least 5 %. ' +
                    ' This way high volatile coins could be detected.'
            },
            {
                header: 'min(1H) >= average(30W)',
                content: 'Get all coins which stays for at least one hour over the long term trend.' +
                    ' You might want to go long or cover short.'
            },
            {
                header: 'min(1H) <= min(2W)',
                content: 'Get all coins which have their two week minimum within the last hour. '
            }
        ],
        max: [
            {
                header: 'max(1H) >= 1.05 * min(1H)',
                content: 'Get all coins which have a min-max spread of at least 5 %. ' +
                    ' This way high volatile coins could be found for day trading.'
            },
            {
                header: 'max(1H) <= max(2W)',
                content: 'Get all coins which have their two week maximum within the last hour. '
            }
        ],
        deviation: [
            {
                header: 'value <= deviation(8W, -1)',
                content: 'Get all coins which currently have a value lower then the average' +
                    ' of the last eight weeks minus its standard deviation.\nThis could indicate a cheap coin or a trend change.'
            },
            {
                header: 'min(1H) >= deviation(8W, 2)',
                content: 'Get all coins which have a minimum within the last hour which is greater ' +
                    ' then the average of the last eight weeks plus its double standard deviation.\nThis might indicate a trend change. '
            },
        ]
    };
}
