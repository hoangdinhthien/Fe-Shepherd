import BaseAPI from '../config/baseAPI';

class TransactionAPI extends BaseAPI {
  getTransactionByGroup(groupId) {
    const url = `/transaction?GroupID=${groupId}`;
    return this.getCustom(url);
  }
  getChurchBudgetHistory() {
    const url = `/transaction?Type=Chi%20ph%C3%AD%2CT%E1%BB%AB%20thi%E1%BB%87n&OrderBy=7`;
    return this.getCustom(url);
  }
  getTransactionOverview() {
    const url = `/transaction/GetStatistics`;
    return this.getCustom(url);
  }
  getTransactionGroupOverview(groupId) {
    const url = `/transaction/GetStatistics?GroupID=${groupId}`;
    return this.getCustom(url);
  }
  updateStatusTransaction(id) {
    const url = `/transaction/${id}`;
    return this.putCustom(url);
  }
}
export default new TransactionAPI();
