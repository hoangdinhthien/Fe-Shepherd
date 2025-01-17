import BaseAPI from '../../config/baseAPI';

class AdminBudgetAPI extends BaseAPI {
  // Thêm tham số pageNumber và pageSize vào phương thức
  getAllTransactions(pageNumber = 1, pageSize = 10) {
    const url = `/transaction?OrderBy=7&PageNumber=${pageNumber}&PageSize=${pageSize}`;
    console.log('URL:', url);
    return this.getCustom(url);
  }
}

export default new AdminBudgetAPI();
