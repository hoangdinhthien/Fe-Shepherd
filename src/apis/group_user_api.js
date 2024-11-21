import BaseAPI from '../config/baseAPI';

class GroupUserAPI extends BaseAPI {
  constructor() {
    super('group-user');
  }

  getGroupMembers(groupId) {
    return super.getAll({ groupId });
  }
}

export default new GroupUserAPI();
