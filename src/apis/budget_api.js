import BaseAPI from '../config/baseAPI';

class BudgetAPI extends BaseAPI {
  constructor() {
    super('church-budget'); // Đường dẫn cơ sở cho ngân sách
  }

  // Lấy tất cả ngân sách
  getBudgets(params) {
    const url = `${this.url}`; // URL để lấy tất cả ngân sách
    return super.getCustom(url, params); // Gọi phương thức GET từ BaseAPI
  }

  // Phương thức cập nhật thông tin ngân sách
  updateBudget(budgetId, budgetData) {
    const url = `${this.url}/${budgetId}`; // URL để cập nhật ngân sách
    return super.putCustom(url, budgetData); // Gọi phương thức PUT từ BaseAPI
  }
}

export default new BudgetAPI();
