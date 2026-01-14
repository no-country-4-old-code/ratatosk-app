import {deletePortfolioWallet} from '../../../helper/firestore/delete';

export function deletePortfolioData(userId: string): Promise<any> {
    return deletePortfolioWallet(userId);
}
