import BaseAPI from '../config/baseAPI';

class NotificationAPI extends BaseAPI {
  constructor() {
    super('notification');
  }

  getNotifications(params) {
    const url = `${this.url}`;
    return super.getCustom(url, params);
  }

  getNotificationByGroupId(groupId, params) {
    const url = `${this.url}?GroupID=${groupId}`;
    return super.getCustom(url, params);
  }
}

export default new NotificationAPI();
