// Api

import {AssetId} from '@shared_library/datatypes/data';

export interface GeckoApiFrontend {
    fetch: (id: AssetId<'coin'>) => Promise<ResponseGeckoCoinFrontend>
}

// Response data

export interface ResponseGeckoCoinFrontend {
    "block_time_in_minutes": number,
    "hashing_algorithm": string,
    "categories": string[],
    "genesis_date": string, // e.g. "2009-01-03",
    "sentiment_votes_up_percentage": number, // e.g.  84.18,
    "sentiment_votes_down_percentage": number, // e.g. 15.82,
    "market_cap_rank": number, // e.g. 1,
    "coingecko_rank": number, // e.g. 1,
    "coingecko_score": number, // e.g. 81.317,
    "developer_score": number, // e.g. 98.883,
    "community_score": number, // e.g. 75.318,
    "liquidity_score": number, // e.g. 100.038,
    "status_updates": any[], // [],
    "last_updated": string // e.g. "2021-06-16T06:01:54.877Z"
    "public_interest_score": number, // e.g. 0.381,
    "public_interest_stats": {
        "alexa_rank": number, // e.g. 9440,
        "bing_matches": number, // e.g. null
    },
    "description": {
        'en': string
    },
    "links": {
        "homepage": string[],
        "blockchain_site": string[], // e.g. "https://blockchair.com/bitcoin/"
        "official_forum_url": string[], // e.g. "https://bitcointalk.org/"
        "twitter_screen_name": string, // e.g. "bitcoin",
        "facebook_username": string, // e.g. "bitcoins",
        "subreddit_url": string, // e.g."https://www.reddit.com/r/Bitcoin/",
        "repos_url": {
            "github": string[], // e.g. "https://github.com/bitcoin/bitcoin",
            "bitbucket": string[],
        }
    },
}
