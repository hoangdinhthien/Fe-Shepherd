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

  readOneNotification(id) {
    const url = `${this.url}/ReadOne/${id}`;
    return super.putCustom(url, true);
  }

  readAllNotifications() {
    const url = `${this.url}/ReadAll`;
    return super.putCustom(url);
  }
}

export default new NotificationAPI();
