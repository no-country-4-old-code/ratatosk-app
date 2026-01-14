import {
    RequestAddNewUser,
    ResponseAddNewUser
} from '../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {reCaptchaApi} from '../../helper/recaptcha/api';
import {ResponseRecaptchaVerification} from '../../helper/recaptcha/interfaces';
import {mapToPromise} from '../../../../../../shared-library/src/functions/map-to-promise';
import {assignUserToFirebaseProject} from './helper/assign-user-to-project';
import {FirebaseUserProjectInfo} from './helper/interfaces';
import {getLeastFilledProject} from './helper/get-least-filled-project';
import {getFirebaseProjectInfos} from './helper/get-firebase-project-infos';


export function parseAddNewUserRequest(query: any): RequestAddNewUser {
    // query could contain very evil code
    const maxLength = 70;
    return {
        email: query.email.slice(0, maxLength),
        token: query.token
    };
}

export function addNewUser(request: RequestAddNewUser, ipAddress: string): Promise<ResponseAddNewUser> {
    return reCaptchaApi.verifyToken(request.token, ipAddress).then(verifyResult => {
        let check = evaluateVerificationResult(verifyResult);
        if (check.success) {
            return getFirebaseProjectInfo().then(project => {
                check = evaluateFirebaseProject(project);
                if (check.success && project !== undefined) {
                    return assignUserToFirebaseProject(request.email, project.name);
                }
                return mapToPromise(check);
            });
        }
        return mapToPromise(check);
    });
}

// private

function getFirebaseProjectInfo(): Promise<FirebaseUserProjectInfo | undefined> {
    return getFirebaseProjectInfos().then(projects => {
            return getLeastFilledProject(projects);
        }
    );
}

function evaluateVerificationResult(verifyResult: ResponseRecaptchaVerification): ResponseAddNewUser {
    const minimalVerificationScore = 0.3;

    if (verifyResult.success && verifyResult.score !== undefined) {
        if (verifyResult.score >= minimalVerificationScore) {
            console.log('Add new user with score ', verifyResult.score);
            return createPositiveResponse();
        } else {
            console.warn('Block new user with score ', verifyResult.score);
            return createNegativeResponse(`Bad score of ${verifyResult.score}`);
        }
    }
    return createNegativeResponse(JSON.stringify(verifyResult['error-codes']));
}

function evaluateFirebaseProject(projectInfo: FirebaseUserProjectInfo | undefined): ResponseAddNewUser {
    const maximalNumberOfUsersPerProject = 20000;
    if (projectInfo === undefined) {
        return createNegativeResponse('Internal error during verification. Please try again in a few minutes. ');
    }
    else if (projectInfo.numberOfUsers >= maximalNumberOfUsersPerProject) {
        return createNegativeResponse('Sorry, Ratatosk already reached the user limit of its first release phase. ' +
            'We will exceed this limit until january 2021. Follow us on twitter to not miss this moment.\'');
    }
    else {
        return createPositiveResponse();
    }
}

function createPositiveResponse(): ResponseAddNewUser {
    return {
        success: true
    };
}


function createNegativeResponse(msg: string): ResponseAddNewUser {
    return {
        success: false,
        msg
    };
}
