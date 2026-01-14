import {PubSubContent, PubSubTopic} from './interfaces';
import {pubSubApi} from './lib/api';


export function triggerSchedulePeriodicScan(): Promise<void> {
    return sendToTopic('schedulePeriodicScan', {timestamp: Date.now()});
}

export function triggerRunPeriodicScan(userIds: string[]): Promise<void> {
    return sendToTopic('runPeriodicScan', {userIds});
}

// private

function sendToTopic(topicName: PubSubTopic, payload: PubSubContent): Promise<void> {
    const pubSub = pubSubApi.getPubSub();
    const topic = pubSub.topic(topicName);
    const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
    return topic.publish(payloadBuffer);
}