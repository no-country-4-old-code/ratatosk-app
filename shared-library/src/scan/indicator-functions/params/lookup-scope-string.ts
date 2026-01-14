import {getScopes} from './get-params';
import {ScopeInMin} from './interfaces-params';

type LookupScope2String = { [scope in ScopeInMin]: string };


export const lookupScope2String: LookupScope2String = getLookupScope2String();

// private

function getLookupScope2String(): LookupScope2String {
    const lookup: any = {};
    const lookupStepWidth: any = {'H': 60, 'D': 1440, 'W': 10080, 'Y': 524160};
    getScopes().forEach((scope: ScopeInMin) => {
        const step = ['Y', 'W', 'D', 'H'].find(currentStep => scope % lookupStepWidth[currentStep] === 0);
        if (step === undefined) {
            throw new Error('Not resolvable scope ' + scope);
        } else {
            const factor = scope / lookupStepWidth[step];
            lookup[scope] = `${factor}${step}`;
        }
    });
    return lookup as LookupScope2String;
}
