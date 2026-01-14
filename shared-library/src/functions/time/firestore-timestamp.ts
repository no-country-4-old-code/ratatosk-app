import {Timestamp} from '../../datatypes/user';

const factorMilli2Nano = 1000000;
const factorSec2Milli = 1000;

export function mapTimestampToMs(timestamp: Timestamp): number {
    return timestamp.seconds * factorSec2Milli + timestamp.nanoseconds / factorMilli2Nano;
}

export function mapMsToTimestamp(timestampInMs: number): Timestamp {
    const seconds = Math.floor(timestampInMs / factorSec2Milli);
    const millisecondsLeft = timestampInMs - seconds * factorSec2Milli;
    const nanoseconds = Math.floor(millisecondsLeft * factorMilli2Nano);
    return {seconds, nanoseconds};
}