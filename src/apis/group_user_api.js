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
  findGroupUserId(memberId, groupId) {
    const url = `${this.url}?GroupId=${groupId}&SearchKey=${memberId}`;
    return super.getCustom(url, memberId, groupId);
  }
  removeMember(groupUserId) {
    const url = `${this.url}/${groupUserId}`;
    return super.deleteCustom(url, groupUserId);
  }
  updateMemberRole(groupUserId, groupUserData) {
    const url = `${this.url}/${groupUserId}`;
    const body = groupUserData.role.toString();
    console.log('Updated Role:', body);
    console.log('groupUserId :', groupUserId);
    console.log('URL :', url);

    return super.putCustom(url, body);
  }
}

export default new GroupUserAPI();
