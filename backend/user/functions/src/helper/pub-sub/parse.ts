import {PubSubPeriodicScan, PubSubScheduleScan} from './interfaces';

export function mapMessage2PubSubPeriodicScan(message: any): PubSubPeriodicScan {
    return message.json;
}

export function mapMessage2PubSubScheduleScans(message: any): PubSubScheduleScan {
    return message.json;
}
