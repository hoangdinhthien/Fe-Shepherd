import BaseAPI from '../config/baseAPI';

class CeremoniesAPI extends BaseAPI {
  constructor() {
    super('ceremony');
  }

  getCeremonies(params) {
    const url = `${this.url}/calendar`;
    return super.getCustom(url, { params });
  }
}

export default new CeremoniesAPI();
