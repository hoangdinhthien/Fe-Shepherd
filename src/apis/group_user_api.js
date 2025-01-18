import BaseAPI from '../config/baseAPI';

class GroupUserAPI extends BaseAPI {
  constructor() {
    super('group-user');
  }

  getGroupMembers(groupId) {
    return super.getAll({ groupId });
  }

  assignUserToGroup(payload) {
    const url = `${this.url}`;
    return super.postCustom(url, payload);
  }
}

export default new GroupUserAPI();
