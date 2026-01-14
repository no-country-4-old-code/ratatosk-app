import {appVersion, appVersionBuildNumber} from '@shared_library/settings/version';
import {firebaseAppUrl} from '@shared_library/settings/firebase-projects';

interface InternalLinks {
    readonly linkToMenu: string;
    readonly linkToLandingPage: string;
    readonly linkToAbout: string;
    readonly linkToLogin: string;
    readonly linkToRegister: string;
    readonly linkToImpressum: string;
    readonly linkToPrivatePolicy: string;
    readonly linkToTermsAndConditions: string;
    readonly linkToDisclaimer: string;
}

interface AppInfo {
    readonly name: string;
    readonly version: string;
    readonly versionBuildNumber: string;
    readonly url: string;
    readonly shareDialog: string;
    readonly twitterAccountUrl: string;
    readonly tagsQuestion: string;
    readonly tagsFeatureRequest: string;
    readonly tagsBug: string;
    readonly emailProSupport: string;
    readonly emailContact: string;
    readonly internalLinks: InternalLinks;
}

const appName = 'Ratatosk';
const appTag = `@ratatosk_app`;

export const appInfo: Readonly<AppInfo> = {
    name: appName,
    version: appVersion,
    versionBuildNumber: appVersionBuildNumber,
    url: firebaseAppUrl,
    shareDialog: `Ready for your new superpower ? Analyse more than 500+ cryptocurrencies in a blink of time with ${appName} !`,
    twitterAccountUrl: '---',
    tagsQuestion: `${appTag} #question`,
    tagsFeatureRequest: `${appTag} #feature`,
    tagsBug: `${appTag} #bug`,
    emailProSupport: '---',
    emailContact: '---',
    internalLinks: {
        linkToMenu: '/menu',
        linkToLandingPage: '/landing-page',
        linkToAbout: '/menu/options/about',
        linkToLogin: '/menu/options/login',
        linkToRegister: '/menu/options/login',
        linkToImpressum: '/menu/options/impressum',
        linkToPrivatePolicy: '/menu/options/legal-notes/privacy-policy',
        linkToTermsAndConditions: '/menu/options/legal-notes/terms-and-conditions',
        linkToDisclaimer: '/menu/options/legal-notes/disclaimer',
    }
};
