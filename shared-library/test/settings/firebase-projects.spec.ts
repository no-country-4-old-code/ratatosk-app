import {isFirebaseUserProject} from '../../src/settings/firebase-projects';

describe('Test firebase projects', function () {

    describe('Test is user project check', function () {

        it('should return true if it is a user projct', function () {
            expect(isFirebaseUserProject('USER_000'));
            expect(isFirebaseUserProject('USER_001'));
            expect(isFirebaseUserProject('USER_002'));
            expect(isFirebaseUserProject('USER_999'));
            expect(isFirebaseUserProject('USER_ABC'));
            expect(isFirebaseUserProject('USER_ZZZ'));
        });

        it('should return false if it is not a user projct', function () {
            expect(isFirebaseUserProject('USER_0001'));
            expect(isFirebaseUserProject('USER_01'));
            expect(isFirebaseUserProject('USE__001'));
            expect(isFirebaseUserProject('SCHEDULE'));
            expect(isFirebaseUserProject('WEBPAGE'));
        });
    });
    
});