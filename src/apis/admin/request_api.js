import BaseAPI from '../../config/baseAPI';

class AdminRequestAPI extends BaseAPI {
  constructor() {
    super(`request`);
  }

  getAllRequests() {
    const url = `${this.url}/GetRequests`;
    return super.getCustom(url);
  }
}

export default new AdminRequestAPI();
