import BaseAPI from '../../config/baseAPI';

class AdminCalendarAPI extends BaseAPI {
  getAllCeremonies() {
    const url = '/ceremony';
    return this.getCust(url);
  }
}

export default new AdminCalendarAPI();
