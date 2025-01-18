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

  // get user role
  getUserRole() {
    const url = `${this.url}/role`;
    return this.get(url);
  }
   updateUserFirstTime(userData) {
    const url = `${this.url}/FirstUpdate`;
    const body = {
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      imageUrl : userData.imageUrl,
      password : userData.password,
    };
    return this.putCustom(url, body);
  }
}

export default new UserAPI();
