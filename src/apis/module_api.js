import axiosClient from '../config/axios';
import BaseAPI from '../config/baseAPI';

class ModuleAPI extends BaseAPI {
  constructor() {
    super('module');
  }

  getGroupModule(params) {
    const url = `${this.url}/GetGroupModule`;
    return super.getCustom(url, params);
  }
}

export default new ModuleAPI();
