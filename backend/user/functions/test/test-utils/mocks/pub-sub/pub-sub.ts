class PubSubTopicObjMock {
    // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-unused-vars
    publish(buffer: any): Promise<void> {
        return new Promise<void>((resolve) => resolve());
    }
}

export class PubSubMock {
    // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-unused-vars
    topic(topicName: string) {
        return new PubSubTopicObjMock();
    }
}
