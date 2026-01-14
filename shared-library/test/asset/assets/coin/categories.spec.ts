import {getCoinIds} from '../../../../src/asset/assets/coin/helper/get-ids-and-info';
import {lookupCoinInfo} from '../../../../src/asset/assets/coin/helper/lookup-coin-info-basic';
import {getCoinCategories} from '../../../../src/asset/assets/coin/helper/get-categories';
import {lookupAssetFactory} from '../../../../src/asset/lookup-asset-factory';

describe('Test get coin categories', function () {
    const assetCoin = lookupAssetFactory['coin'];
    let categoriesNew: string[];
    let categoriesInInfo: string[];
    let categoriesOld: string[];

    beforeEach(function () {
        categoriesNew = getCoinCategories();
        categoriesInInfo = getCategoriesOfCoinInfo();
        categoriesOld = getOldCategories();
    });

    it('should only contain categories which are also in lookup coin info', function () {
        getCoinCategories().forEach(category => {
            expect(categoriesInInfo).toContain(category);
        });
    });

    it('should contain all categories which are in lookup coin info', function () {
        categoriesInInfo.forEach(category => {
            expect(getCoinCategories()).toContain(category);
        });
    });

        it('should have at least one category for every coin (python should tag with "Without category")', function () {
        assetCoin.getIds().forEach(id => {
            const categories = lookupCoinInfo[id].categories;
            expect(categories.length).toBeGreaterThan(0, `${id} has no catgories: ${categories}`);
        });
    });

    it('should always(!) append new categories at the end of the new ids ' +
        '(actually no categories could be removed [would break compression], if this is wanted a fixed lookup table have to substitute the current solution)', function () {
        const slicedNew = categoriesNew.slice(0, categoriesOld.length);
        expect(slicedNew).toEqual(categoriesOld);
    });

    it('IF (!!!) the other test all passes then adapt old category', function () {
        expect(categoriesNew).toEqual(categoriesOld);
    });

});


function getCategoriesOfCoinInfo(): string[] {
    const onlyUnique = (element: string, index: number, array: string[]) => array.indexOf(element) === index;
    return getCoinIds()
        .flatMap(id => lookupCoinInfo[id].categories)
        .filter(onlyUnique);
}

function getOldCategories(): string[] {
    return [
        "Cryptocurrency",
        "Smart Contract Platform",
        "Near Protocol Ecosystem",
        "Fantom Ecosystem",
        "Arbitrum Ecosystem",
        "Avalanche Ecosystem",
        "Binance Smart Chain Ecosystem",
        "Polygon Ecosystem",
        "USD Stablecoin",
        "Stablecoins",
        "Centralized Exchange Token (CEX)",
        "Exchange-based Tokens",
        "xDAI Ecosystem",
        "Solana Ecosystem",
        "Cosmos Ecosystem",
        "Terra Ecosystem",
        "Decentralized Finance (DeFi)",
        "Polkadot Ecosystem",
        "Meme Tokens",
        "Harmony Ecosystem",
        "Seigniorage",
        "Wrapped-Tokens",
        "Tokenized BTC",
        "Eth 2.0 Staking",
        "Infrastructure",
        "Oracle",
        "Business Services",
        "Automated Market Maker (AMM)",
        "Governance",
        "Decentralized Exchange Token (DEX)",
        "Yield Farming",
        "Internet of Things (IOT)",
        "Artificial Intelligence",
        "Business Platform",
        "Axie Infinity",
        "Metaverse",
        "Play To Earn",
        "Non-Fungible Tokens (NFT)",
        "Gaming",
        "Storage",
        "Protocol",
        "Privacy Coins",
        "Entertainment",
        "Finance / Banking",
        "Compound Tokens",
        "Asset-backed Tokens",
        "Analytics",
        "Without category",
        "Lending/Borrowing",
        "Sports",
        "Communication",
        "Yield Aggregator",
        "Celo Ecosystem",
        "Olympus Pro",
        "Synthetic Issuer",
        "Derivatives",
        "Masternodes",
        "Music",
        "Yearn Ecosystem",
        "Insurance",
        "MEV Protection",
        "Prediction Markets",
        "Collectibles",
        "Number",
        "Technology & Science",
        "Tokenized Gold",
        "Perpetuals",
        "Social Money",
        "Rebase Tokens",
        "Wallets",
        "Asset Manager",
        "Launchpad",
        "Investment",
        "ETF",
        "Options",
        "Software",
        "DaoMaker Ecosystem",
        "Energy",
        "HECO Chain Ecosystem",
        "Binance Launchpool",
        "EUR Stablecoin",
        "Synths",
        "Big Data",
        "Gambling",
        "Media",
        "Index",
        "DeFi Index",
        "Structured Products",
        "TokenSets",
        "Leveraged Token",
        "Tourism",
        "Real Estate",
        "Augmented Reality",
        "Virtual Reality",
        "Marketing",
        "Fan Token"
    ];
}