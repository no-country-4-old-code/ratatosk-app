import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {firebaseAppUrl} from '../../../../shared-library/src/settings/firebase-projects';

admin.initializeApp();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors')({origin: firebaseAppUrl});

/*
! Adding new functions !
onRequest-Functions now have permissions.
See "https://console.cloud.google.com/functions/list?folder=&organizationId=&project=playground-a8450e".
To make it available for user, you have to add "allUser" with role "Cloud Function Invoker"
("allAuthenticatedUser" only works for google accounts).
For other stuff, see firebase console:
https://console.firebase.google.com/project/playground-a8450e/functions/logs?functionFilter=cancelPro(us-central1)&search=&severity=DEBUG
 */


export const registerNewUser = functions
    .https.onRequest(async (req, res) => {
        const moduleAddNewUser = await import('./functions/user/add-new-user');
        const parsed = moduleAddNewUser.parseAddNewUserRequest(req.query as any);
        const response = await moduleAddNewUser.addNewUser(parsed, req.ip);
        cors(req, res, () => {
            res.status(200).send({response: JSON.stringify(response)});
        });
    });
