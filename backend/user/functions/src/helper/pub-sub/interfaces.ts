export type PubSubTopic = 'runPeriodicScan' | 'schedulePeriodicScan'
export type PubSubContent = PubSubPeriodicScan | PubSubScheduleScan

export interface PubSubPeriodicScan {
    userIds: string[];
}

export interface PubSubScheduleScan {
    timestamp: number;
}

