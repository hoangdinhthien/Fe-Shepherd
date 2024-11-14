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

  getRequestDetails(eventId, type) {
    const url = `${this.url}/GetRequestDetails`;
    return super.getCustom(url, { EventId: eventId, Type: type });
  }

  // get request type
  getRequestType() {
    const url = `${this.url}/GetType`;
    return super.getCustom(url);
  }
}

export default new RequestAPI();
