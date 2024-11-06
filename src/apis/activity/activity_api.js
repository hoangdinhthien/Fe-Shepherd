import BaseAPI from '../../config/baseAPI';
import axiosClient from '../../config/axios';

class ActivityAPI extends BaseAPI {
  constructor() {
    super('activity');
  }
}

export default new ActivityAPI();
