import BaseAPI from '../../config/baseAPI';

class ActivityAPI extends BaseAPI {
  constructor() {
    super('activity');
  }

  getActivitiesByGroup(groupId) {
    const url = `${this.url}/group/${groupId}`;
    return super.getCustom(url);
  }

  getActivitiesByGroupAndEvent(groupId, eventId) {
    const url = `${this.url}?EventID=${eventId}&GroupID=${groupId}`;
    return super.getCustom(url);
  }

  getAllActivities() {
    const url = `${this.url}`;
    return this.getCustom(url);
  }
}

export default new ActivityAPI();
