import BaseAPI from '../config/baseAPI';

class NotificationAPI extends BaseAPI {
  constructor() {
    super('notification/GetAll');
  }

  getNotifications(params) {
    return super.getAll(params);
  }
}

export default new NotificationAPI();
