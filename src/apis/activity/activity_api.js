import BaseAPI from '../../config/baseAPI';
import axiosClient from '../../config/axios';

class ActivityAPI extends BaseAPI {
  constructor() {
    super('activity');
  }

  getActivities() {
    return this.handleRequest(axiosClient.get('activity/calendar'));
  }
}

export default new ActivityAPI();
