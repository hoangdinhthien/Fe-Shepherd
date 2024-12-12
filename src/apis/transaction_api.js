import BaseAPI from '../config/baseAPI';

class TransactionAPI extends BaseAPI {
  getTransactionByGroup(groupId) {
    const url = `/transaction?GroupID=${groupId}`;
    return this.getCustom(url);
  }
  getChurchBudgetHistory() {
    const url = `/transaction?Type=Donation%2CExpense&OrderBy=7`;
    return this.getCustom(url);
  }
  getTransactionOverview() {
    const url = `/transaction/GetStatistics`;
    return this.getCustom(url);
  }
}
export default new TransactionAPI();
