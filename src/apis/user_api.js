import axiosClient from '../config/axios';
import BaseAPI from '../config/baseAPI';

class UserAPI extends BaseAPI {
  constructor() {
    super('user');
  }

  getUser(params) {
    const url = `${this.url}/Detail`;
    return this.handleRequest(axiosClient.get(url, { params }));
  }

  getUserRole(userId) {
    const url = `${this.url}/GetUserRole`;
    return this.handleRequest(axiosClient.get(url, { params: { id: userId } }));
  }
}

export default new UserAPI();
