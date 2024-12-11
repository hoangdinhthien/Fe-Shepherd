import BaseAPI from '../../config/baseAPI';

class AdminRequestAPI extends BaseAPI {
  constructor() {
    super(`request`);
  }

  getAllRequests() {
    const url = `${this.url}/GetRequests`;
    return super.getCustom(url);
  }
  getDetailRequests(requestId) {
    const url = `${this.url}/GetRequestDetails?requestId=${requestId}`;
    return super.getCustom(url);
  }
  updateAcceptRequest(requestId) {
    const url = `${this.url}/ApproveAccountRequest?requestId=${requestId}`;
    const body = { isAccepted: true };
    console.log('Request URL:', url);
    console.log('Request Body:', body);
    return super.putCustom(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default new AdminRequestAPI();
