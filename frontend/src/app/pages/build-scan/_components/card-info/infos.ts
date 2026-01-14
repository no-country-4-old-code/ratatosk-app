import {appInfo} from '@app/lib/global/app-info';
import {getUniqueRandomNumbers} from '@app/lib/util/random';
import {maxNumberOfConditions, maxNumberOfScansForPro} from '@shared_library/scan/settings';
import {
    allOptionsFunction,
    allOptionsMetric,
    freeOptionsFunction,
    freeOptionsMetric
} from '@lib/user-role/options/options';

const contentCommon: string[] = [
    `Would you like to know which features are coming next ? Follow us on twitter: ${appInfo.twitterAccountUrl}`,
    `Do you have a feature request ? Write us on twitter ${appInfo.tagsFeatureRequest}`,
    `Do you have a question ? Take a look at our FAQs or write us on twitter ${appInfo.tagsQuestion}`,
    `${appInfo.name} is currently in its early phase. Stay with us and we will offer you the full power of machine learning to all your assets !`,
    'Sharing is good. More people leads to more support for us which leads to more features for you !',
    `Be part of ${appInfo.name} ! Share your feedback and ideas with us and together we will rule the world !\n..or at least create a good app.`,
    `Do you want a bigger chart ?\n Get a bigger screen ;). You could visit us with any device on ${appInfo.url}`,
    `To receive push notifications you have to add ${appInfo.name} to your home screen. Take a look at our FAQ section if you need help.`,
];

const contentPro: string[] = [
    `Thank you for being so awesome and using our pro version !`,
];

const contentNonPro: string[] = [
    `Use up to ${maxNumberOfScansForPro} filters with our pro version`,
    `Our pro version comes with ${allOptionsMetric.length - freeOptionsMetric.length} additional metrics to extend your filters.`,
    `Boost your conditions with our pro version and use up to ${allOptionsFunction.length - freeOptionsFunction.length} additional functions.`,
    `Be more specific by using up to ${maxNumberOfConditions} conditions per filter with our pro version.`,
    `As a pro user you could select all supported coins in the condition build manager to get instant feedback.`,
    `Support us to build, extend and improve ${appInfo.name} by using our pro version.`,
    'I gonna make you an offer you can not refuse.\nOk technical you can refuse...\nBut should you ?\nTake a look at our pro version !',
    'Do you like doing things the smart way ?\nWe too..\nCheck out our pro version !',
];

export function getRandomSelectedInfos(numberOfInfos: number, isPro?: boolean): string[] {
    const possibleContent = getPossibleContentOptions(isPro);
    const idx_list = getUniqueRandomNumbers(numberOfInfos, possibleContent.length - 1);
    return idx_list.map(idx => possibleContent[idx]);
}

// private

function getPossibleContentOptions(isPro?: boolean): string[] {
    let proStatusDependingContent = [];
    if (isPro !== undefined) {
        if (isPro) {
            proStatusDependingContent = contentPro
        } else {
            proStatusDependingContent = contentNonPro;
        }
    }
    console.log('Additional content is ', proStatusDependingContent, isPro);
    return [...contentCommon, ...proStatusDependingContent];
}



