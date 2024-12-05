import BaseAPI from '../../config/baseAPI';

class ActivityAPI extends BaseAPI {
  constructor() {
    super('activity');
  }

  getActivitiesByGroup(groupId) {
    const url = `${this.url}`;
    return this.getCustom(url, { groupId });
  }
  getAllActivities() {
    const url = `${this.url}`;
    return this.getCustom(url);
  }
}

export default new ActivityAPI();
