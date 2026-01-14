import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {PubSubTopic} from './helper/pub-sub/interfaces';
import {firebaseAppUrl} from '../../../../shared-library/src/settings/firebase-projects';
import {cleanInPublicRelease} from '../../../../shared-library/src/functions/clean-in-public-release';

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

export const runAsyncScan = functions
    .runWith({memory: '512MB'})
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            try {
                const moduleScan = await import('./functions/scan/run-async-scan');
                const parsed = moduleScan.parseAsyncScanRequest(req);
                await moduleScan.runAsyncScan(parsed.token, false);
                const response = {success: true, msg: ''};
                console.log('Async run was successful');
                res.status(200).send(response);
            } catch (e) {
                console.error('Error occur during run async filter calculate: ', e.message);
                const response = {success: false, msg: cleanInPublicRelease(e.message)};
                res.status(500).send(response);
            }
        });
    });

export const handleFeedback = functions
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            try {
                const moduleFeedback = await import('./functions/user/reward-feedback');
                const parsed = moduleFeedback.parseRewardFeedbackRequest(req);
                await moduleFeedback.rewardFeedback(parsed.token);
                const response = {success: true, msg: 'Reward feedback'};
                console.log('Reward feedback for ', parsed.token);
                res.status(200).send(response);
            } catch (e) {
                console.error('Error occur during user feeback: ', e.message);
                const response = {success: false, msg: cleanInPublicRelease(e.message)};
                res.status(500).send(response);
            }
        });
    });


export const buyPro = functions
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            // --> Buy pro is currently locked and should be overworked in case of Stripe
            //const moduleBuyProVersion = await import('./functions/user/buy-pro-version');
            //const token = (req.query as any as RequestUserToken).token;
            //await moduleBuyProVersion.buyProVersion(token);
            //res.status(200).send({success: true});
            res.status(200).send({success: false});
        });
    });


export const cancelPro = functions
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            // --> Cancel pro is locked and should be overworked in case of Stripe (delete payment subscription etc)
            // + Also ADD refresh service to extend subscription every day of customers (1 day before expire - otherwise they lost pro status temp)
            //const moduleCancelProVersion = await import('./functions/user/cancel-pro-version');
            //const moduleParseRequest = await import('./functions/user/helper/parse');
            //const request = moduleParseRequest.parseRequestCancelPro(req);
            //await moduleCancelProVersion.cancelProVersion(request.token, request.setCanceled);
            //res.status(200).send({success: true});
            res.status(200).send({success: false});
        });
    });


// helper functions - restrict permission after deploy !

export const helperFunctionInitEmptyProject = functions
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            const m = await import('./functions/project/init-project');
            await m.initFirebaseProject();
            res.status(200).send({success: true});
        });
    });

export const helperFunctionRewriteUserData = functions
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            const m = await import('./functions/project/rewrite-all-users');
            await m.rewriteAllUsers();
            res.status(200).send({success: true});
        });
    });

// pub sub

const pubSubTopicScheduleSyncScan: PubSubTopic = 'schedulePeriodicScan';
const pubSubTopicRunSyncScan: PubSubTopic = 'runPeriodicScan';

// TODO: Get Email / Message etc. everytime this fails !
export const pubSubUpdateDatabase = functions
    .runWith({timeoutSeconds: 110, memory: '2GB'})
    .pubsub.schedule('every 2 minutes')
    .onRun(async () => {
        const moduleUpdate = await import('./functions/update/coin/update-db');
        await moduleUpdate.updateCoinDb(); // req not used, no parsing needed
    });

export const pubSubScheduleSyncScan = functions
    .runWith({timeoutSeconds: 120, memory: '256MB'})
    .pubsub.topic(pubSubTopicScheduleSyncScan).onPublish(async (message) => {
        const moduleSchedule = await import('./functions/scan/schedule-sync-scan');
        const moduleParse = await import('./helper/pub-sub/parse');
        const payload = moduleParse.mapMessage2PubSubScheduleScans(message);
        console.log('Here in schedule periodic @', payload.timestamp);
        await moduleSchedule.scheduleSyncScan(400, 400);
    });

export const pubSubRunSyncScan = functions
    .runWith({timeoutSeconds: 120, memory: '512MB'})
    .pubsub.topic(pubSubTopicRunSyncScan).onPublish(async (message) => {
        const moduleScan = await import('./functions/scan/run-sync-scan');
        const moduleParse = await import('./helper/pub-sub/parse');
        const payload = moduleParse.mapMessage2PubSubPeriodicScan(message);
        console.log('Here in run periodic ', payload.userIds);
        await moduleScan.runSyncScan(payload.userIds);
    });

// firestore triggered

export const handleUserAfterAuth = functions
    .auth.user().onCreate(async (user) => {
        const m = await import('./functions/user/after-auth');
        await m.handleUserAfterAuth(user.uid, user.email);
    });

export const deleteUserDataOnAccountDeletion = functions.auth.user()
    .onDelete(async (user) => {
        const m1 = await import('./functions/user/delete-user');
        const m2 = await import('./functions/user/portfolio/delete-portfolio');
        await m1.deleteUserData(user.uid);
        await m2.deletePortfolioData(user.uid);
    });

export const incrementNumberOfUserOnUserCreation = functions.firestore.document('users/{id}')
    .onCreate(async (doc, context) => {
        console.log('ON CREATE --> Increment Number is triggered');
        const m = await import('./functions/user/update-number-of-users');
        await m.updateNumberOfUsers(context.eventId, 1);
    });

export const decrementNumberOfUserOnUserDeletion = functions.firestore.document('users/{id}')
    .onDelete(async (doc, context) => {
        console.log('ON DELETE --> Decrement Number is triggered');
        const m = await import('./functions/user/update-number-of-users');
        await m.updateNumberOfUsers(context.eventId, -1);
    });
