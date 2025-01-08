import BaseAPI from '../../config/baseAPI';

class AdminUserAPI extends BaseAPI {
  constructor() {
    super(`user`);
  }

  // API lấy danh sách người dùng có phân trang
  getAllUsers({ pageNumber = 1, pageSize = 15 }) {
    const url = `${this.url}/GetAll?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    return super.getCustom(url);
  }

  // Phương thức tạo người dùng mới
  createUser(userData) {
    const url = `${this.url}`;
    return super.postCustom(url, userData);
  }
}

export default new AdminUserAPI();
