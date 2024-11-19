import BaseAPI from '../../config/baseAPI';

class ActivityAPI extends BaseAPI {
  constructor() {
    super('activity');
  }
}

export default new ActivityAPI();
