import {Request} from 'firebase-functions/lib/providers/https';
import {RequestCancelPro} from '../../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';

export function parseRequestCancelPro(req: Request): RequestCancelPro {
    // parsing needed because everything is a string now
    return {
        token: req.query.token as string,
        setCanceled: req.query.setCanceled === 'true'
    };
}
