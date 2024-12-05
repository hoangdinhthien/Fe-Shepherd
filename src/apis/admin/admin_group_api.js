import BaseAPI from '../../config/baseAPI';

class AdminGroupAPI extends BaseAPI {
  constructor() {
    super('group'); // Đường dẫn cơ sở cho các nhóm
  }

  // Lấy tất cả các nhóm
  getAllGroups(params) {
    const url = `${this.url}`; // URL để lấy tất cả các nhóm
    return super.getCustom(url, params); // Gọi phương thức GET từ BaseAPI
  }

  async createGroup(groupData) {
    const url = `${this.url}`;
    try {
      const response = await super.postCustom(url, groupData);
      return response; // Trả về dữ liệu từ API
    } catch (error) {
      console.error(
        'Lỗi khi tạo nhóm:',
        error.response ? error.response.data : error
      );
      throw error; // Quăng lỗi nếu có lỗi
    }
  }

  async checkGroupNameExist(groupName) {
    try {
      const response = await this.getAllGroups();
      if (response.success && Array.isArray(response.result)) {
        const groupExists = response.result.some(
          (group) => group.name.toLowerCase() === groupName.toLowerCase()
        );
        return groupExists;
      } else {
        console.error('API trả về dữ liệu không hợp lệ:', response);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra tên nhóm:', error);
      return false;
    }
  }

  // Phương thức lấy thông tin chi tiết của một nhóm theo ID
  getGroupById(groupId) {
    const url = `${this.url}/GetById/${groupId}`; // URL để lấy thông tin chi tiết nhóm
    return super.getCustom(url);
  }

  // Phương thức cập nhật thông tin nhóm
  updateGroup(groupId, groupData) {
    const url = `${this.url}/${groupId}`; // URL để cập nhật nhóm
    return super.putCustom(url, groupData); // Gọi phương thức PUT từ BaseAPI
  }

  // Phương thức xóa nhóm theo ID
  deleteGroup(groupId) {
    const url = `${this.url}/${groupId}`; // URL để xóa nhóm
    return super.deleteCustom(url); // Gọi phương thức DELETE từ BaseAPI
  }
}

export default new AdminGroupAPI();
