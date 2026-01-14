import {ResponseRecaptchaVerification} from './interfaces';
import {reCaptchaSecretKey} from './recaptcha-backend-key';

export const reCaptchaApi = {
    verifyToken: verifyReCaptchToken
};


function verifyReCaptchToken(token: string, ipAddress: string): Promise<ResponseRecaptchaVerification> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fetch = require('node-fetch');
    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const params = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${reCaptchaSecretKey}&response=${token}&remoteip=${ipAddress}`,
    };
    return fetch(url, params).then((response: any) => {
        return response.json();
    });
}