import BaseAPI from '../config/baseAPI';

class GroupAPI extends BaseAPI {
  getAllGroups() {
    return super.getAll();
  }

  // Get all groups for the current user by passing userId as a parameter
  getGroupsForUser(userId) {
    return super.getAll({ userId });
  }
}

export default new GroupAPI('group');
