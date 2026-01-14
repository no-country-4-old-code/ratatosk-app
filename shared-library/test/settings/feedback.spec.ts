import {Feedback} from '../../src/settings/feedback';

describe('Test feedback', function () {
    let feedback: Feedback;

    beforeEach(function () {
        feedback = new Feedback();
    });

    function getCurrentTimeMs() {
        return new Date().getTime();
    }

    describe('- function "is feedback enabled"', function () {

        it('should return false if current time < start time', function () {
            feedback['timestampStart'] = getCurrentTimeMs() + 1000;
            feedback['timestampEnd'] = getCurrentTimeMs() + 10000;
            expect(feedback.isFeedbackEnabled()).toBeFalsy();
        });

        it('should return false if current time > end time', function () {
            feedback['timestampStart'] = 0;
            feedback['timestampEnd'] = getCurrentTimeMs() - 1000;
            expect(feedback.isFeedbackEnabled()).toBeFalsy();
        });

        it('should return true if start time < current time < end time', function () {
            feedback['timestampStart'] = getCurrentTimeMs() - 1000;
            feedback['timestampEnd'] = getCurrentTimeMs() + 1000;
            expect(feedback.isFeedbackEnabled()).toBeTrue();
        });
    });

    describe('- function "has given feedback"', function () {

        beforeEach(function () {
            feedback['timestampStart'] = 1000;
        });

        it('should return false if user time is undefined', function () {
            expect(feedback.hasGivenFeedback(undefined)).toBeFalsy();
        });

        it('should return false if user time < start time', function () {
            expect(feedback.hasGivenFeedback(999)).toBeFalsy();
        });

        it('should return false if user time > start time', function () {
            expect(feedback.hasGivenFeedback(1001)).toBeTrue();
        });
    });
});