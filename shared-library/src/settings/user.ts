import {maxSampleIntervalInMinutes} from './sampling';

export const maxNumberOfPushIds = 4;

const maxSampleIntervalInSeconds = 60 * maxSampleIntervalInMinutes;
export const lastUserActivityExpireTimeInSec = 2 * maxSampleIntervalInSeconds; // how long count a user active after his last activity