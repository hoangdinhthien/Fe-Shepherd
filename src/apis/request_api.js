import BaseAPI from '../config/baseAPI';

class RequestAPI extends BaseAPI {
  constructor() {
    super(`request`);
  }

  // request create event
  createRequest(id, data) {
    const url = `${this.url}/CreateEvent?groupId=${id}`;
    return super.postCustom(url, data);
  }

  // request create account
  createAccount(data) {
    const url = `${this.url}/CreateAccount`;
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

  updateRequestStatus(requestId, data) {
    const url = `${this.url}/ApproveEventRequest?requestId=${requestId}`;
    return super.putCustom(url, data);
  }
}

export default new RequestAPI();
