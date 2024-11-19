import BaseAPI from '../../config/baseAPI';

class AdminUserAPI extends BaseAPI {
  constructor() {
    super(`user`);
  }
  // Nếu muốn lấy tất cả người dùng, có thể gọi trực tiếp `getAll`
  getAllUsers(params) {
    const url = `${this.url}/GetAll`;
    return super.getCustom(url, params);
  }

  // Phương thức tạo người dùng mới
  createUser(userData) {
    const url = `${this.url}`;
    return super.postCustom(url, userData);
  }
}

export default new AdminUserAPI();
