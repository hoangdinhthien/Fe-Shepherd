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

  getRequestDetails(requestId) {
    const url = `${this.url}/GetRequestDetails`;
    return super.getCustom(url, { requestId });
  }

  // get request type
  getRequestType() {
    const url = `${this.url}/GetType`;
    return super.getCustom(url);
  }
}

export default new RequestAPI();
