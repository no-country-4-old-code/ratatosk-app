import {ResponseRecaptchaVerification} from '../../../../src/helper/recaptcha/interfaces';
import {reCaptchaApi} from '../../../../src/helper/recaptcha/api';
import {mapToPromise} from '../../../../../../../shared-library/src/functions/map-to-promise';

export function spyOnRecaptchaVerify(response: ResponseRecaptchaVerification): jasmine.Spy {
    const promise = mapToPromise(response);
    return spyOn(reCaptchaApi, 'verifyToken').and.returnValue(promise);
}