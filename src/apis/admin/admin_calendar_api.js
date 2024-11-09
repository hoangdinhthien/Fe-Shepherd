import BaseAPI from '../../config/baseAPI';

class AdminCalendarAPI extends BaseAPI {
  getAllCeremonies() {
    const url = '/ceremony/calendar';
    return this.getCustom(url);
  }
}

export default new AdminCalendarAPI();
