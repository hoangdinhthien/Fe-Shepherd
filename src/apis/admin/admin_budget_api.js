import BaseAPI from '../../config/baseAPI';

class AdminBudgetAPI extends BaseAPI {
  getAllTransactions() {
    const url = `transaction`;
    console.log('URL:', url);
    return this.getCustom(url);
  }
}

export default new AdminBudgetAPI();
