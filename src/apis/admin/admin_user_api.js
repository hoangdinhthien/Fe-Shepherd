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

  getUserById(userId) {
    const url = `${this.url}/Detail?id=${userId}`;
    return super.getCustom(url);
  }

  // Phương thức tạo người dùng mới
  createUser(userData) {
    const url = `${this.url}`;
    return super.postCustom(url, userData);
  }

  updateUserById(userData) {
    const url = `${this.url}`;
    // Đảm bảo dữ liệu được format đúng
    const body = {
      id: userData.id,
      name: userData.name?.trim(),
      phone: userData.phone?.trim(),
      email: userData.email?.trim(),
      role: userData.role || 'Member',
    };

    // Log data trước khi gửi
    console.log('Updating user with data:', body);

    return this.putCustom(url, body);
  }

  deleteUserById(userId) {
    const url = `${this.url}/${userId}`;
    return super.deleteCustom(url); // hoặc phương thức phù hợp từ class cha
  }
}

export default new AdminUserAPI();
