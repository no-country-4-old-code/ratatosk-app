/*
Open:
- Datatype description of portfolio
- firstore rules for read / write
- compression / decompression
 */

export interface PortfolioWallet {
    portfolios: Portfolio[];
}

export interface Portfolio {
    dummyToBeFilled?: boolean; // satisfy eslint which does not like empty interfaces
}