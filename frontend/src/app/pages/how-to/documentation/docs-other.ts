import {
    DocumentationMultiple,
    DocumentationSectionPanel,
    DocumentationSectionText
} from '@app/pages/how-to/_components/interfaces';
import {searchEvaluationIntervalInMinutes} from '../../../../../../shared-library/src/scan/settings';
import {appInfo} from '@app/lib/global/app-info';
import {createDocSection} from '@app/pages/how-to/_components/documentation-section/documentation-multiple.component';
import {
    createDocSectionText
} from '@app/pages/how-to/_components/documentation-section-text/documentation-section-text.component';
import {
    createDocSectionPanel
} from '@app/pages/how-to/_components/documentation-section-panel/documentation-section-panel.component';

export const documentationOther: DocumentationMultiple<any> = createDocSection({
    header: 'other',
    content: [{header: '', content: getDocs()}].map(createDocSection)
});

// private

function getDocs(): DocumentationSectionPanel<DocumentationSectionText[]>[] {
    return [
        createDoc('chart interpolation',
            [
                {
                    header: `How does ${appInfo.name} estimate values between samples ?`,
                    content: 'We use linear interpolation as a common technique to give you the estimation of ' +
                        'unknown values that lie between known values.\n\nPlease be aware that these estimated values ' +
                        'could differ from the real values.'
                },
                {
                    header: 'How great is the difference between real and estimated values ?',
                    content: 'The difference is usually small but it increases if you watch signals with a low scope ' +
                        '(e.g. average of 1H) in a long range (e.g. 1 year).'
                }
            ], false),

        createDoc('automatic scan evaluation',
            [
                {
                    header: `How often does ${appInfo.name} recalculate my filters ?`,
                    content: `Your filters are recalculated every ${searchEvaluationIntervalInMinutes} minutes in our cloud.\n\n` +
                        'If anything changed we notify you according to the notification settings in the related scan.\n\n' +
                        'The notification is done using push notifications.\n'
                },
                {
                    header: 'What is needed to receive push notifications ?',
                    content: `To receive push notifications you have to add ${appInfo.name} to your home screen.\n` +
                        'You also have to upgrade your account to the PRO version.' +
                        'For more information regarding this topic take a look at our FAQ section.\n' +
                        'Currently push notification are not supported for IOS devices.'
                },
            ]
            , true)
    ];
}

function createDoc(header: string, content: Partial<DocumentationSectionText>[], isOnlyForPro = false): DocumentationSectionPanel<DocumentationSectionText[]> {
    return createDocSectionPanel({
        header,
        content: content.map(createDocSectionText),
        panelState: false,
        isOnlyForPro: isOnlyForPro
    });
}
