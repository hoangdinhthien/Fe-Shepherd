import BaseAPI from '../config/baseAPI';

class RequestAPI extends BaseAPI {
  constructor() {
    super(`request`);
  }

  createRequest(id, data) {
    const url = `${this.url}/CreateEvent?groupId=${id}`;
    return super.postCustom(url, data);
  }

  getRequests(params) {
    const url = `${this.url}/GetRequests`;
    return super.getCustom(url, params);
  }
}

export default new RequestAPI();
