import BaseAPI from '../../config/baseAPI';

class AdminDashboardAPI extends BaseAPI {
  // Phương thức để lấy tổng số sự kiện
  getEventCount() {
    const url = 'event';
    return this.getCustom(url).then(
      (response) => response.pagination.totalCount
    );
  }

  // Phương thức để lấy tổng số người dùng
  getUserCount() {
    const url = 'user/GetAll';
    return this.getCustom(url).then(
      (response) => response.pagination.totalCount
    );
  }

  // Phương thức để lấy tổng số yêu cầu
  getRequestCount() {
    const url = 'request/GetRequests';
    return this.getCustom(url).then(
      (response) => response.pagination.totalCount
    );
  }

  // Phương thức tính toán phần trăm thay đổi
  calculatePercentageChange(thisMonth, lastMonth) {
    if (lastMonth === 0) return null;
    const change = ((thisMonth - lastMonth) / lastMonth) * 100;
    return Math.round(change);
  }

  getSurplusOrDeficit() {
    const url = '/church-budget';
    return this.getCustom(url).then(
      (response) => response.data.surplusOrDeficit
    );
  }

  getAllEvents() {
    const url = 'event'; // Đường dẫn chính xác đến API của bạn
    return this.getCustom(url).then((response) => response.result); // Truy cập dữ liệu từ "result"
  }

  getRequestFirst() {
    const url = 'request/GetRequests?OrderBy=7';
    return this.getCustom(url).then(
      (response) => response.result[0] // Lấy object đầu tiên từ mảng result
    );
  }
}

export default new AdminDashboardAPI();
