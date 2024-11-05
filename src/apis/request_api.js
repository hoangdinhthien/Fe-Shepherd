import BaseAPI from '../config/baseAPI';

class RequestAPI extends BaseAPI {
  constructor() {
    super(`request`);
  }

  createRequest(id, data) {
    const url = `${this.url}/CreateEvent?groupId=${id}`;
    return super.postCustom(url, data);
  }
}

export default new RequestAPI();
