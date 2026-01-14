// eslint-disable-next-line @typescript-eslint/no-var-requires
const {PubSub} = require('@google-cloud/pubsub');

export const pubSubApi = {
    getPubSub: () => new PubSub()
};