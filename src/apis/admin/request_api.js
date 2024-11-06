import BaseAPI from '../../config/baseAPI';

class AdminRequestAPI extends BaseAPI {
  constructor() {
    super(`request`); // Passes 'request' as the basePath to BaseAPI
  }
  // Phương thức lấy tất cả dữ liệu
  getAllRequests() {
    const url = `${this.url}/GetRequests`;
    return super.getCustom(url);
  }
}

export default new AdminRequestAPI();
