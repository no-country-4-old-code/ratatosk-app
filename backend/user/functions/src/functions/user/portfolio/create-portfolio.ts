import {writePortfolio} from '../../../helper/firestore/write';
import {PortfolioWallet} from '../../../../../../../shared-library/src/datatypes/portfolio';

export function createInitialPortfolio(userId: string): Promise<any> {
    const wallet = createInitialPortfolioWallet();
    return writePortfolio(userId, wallet);
}

// private

function createInitialPortfolioWallet(): PortfolioWallet {
    return {
        portfolios: []
    };
}