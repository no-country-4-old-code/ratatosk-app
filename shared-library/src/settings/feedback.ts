export class Feedback {
    private timestampStart = 0;
    private timestampEnd = this.timestampStart + 1000 * 60 * 60 * 24 * 5;
    private rewardInWeeks = 4;

    isFeedbackEnabled = (): boolean => {
        const currentTime = this.createFeedbackTimestamp();
        return currentTime > this.timestampStart && currentTime < this.timestampEnd;
    };

    hasGivenFeedback = (feedbackTimestamp?: number): boolean => {
        if (feedbackTimestamp !== undefined) {
            return feedbackTimestamp >= this.timestampStart;
        }
        else {
            return false;
        }
    };

    createFeedbackTimestamp = (): number => {
        const date = new Date();
        return date.getTime();
    };

    getNumberOfProWeeks = (): number => {
        return this.rewardInWeeks;
    };

}