import BaseAPI from '../config/baseAPI';

class TransactionAPI extends BaseAPI {
  getTransactionByGroup(groupId) {
    const url = `/transaction?GroupID=${groupId}`;
    return this.getCustom(url);
  }
}
export default new TransactionAPI();
