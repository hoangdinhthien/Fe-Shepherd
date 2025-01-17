import BaseAPI from '../config/baseAPI';

class ImageAPI extends BaseAPI {
  constructor() {
    super('image');
  }
}

export default new ImageAPI();
