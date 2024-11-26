import BaseAPI from '../config/baseAPI';

class TaskAPI extends BaseAPI {
  constructor() {
    super('task');
  }

  getTasksByGroup(groupId, activityId) {
    const url = `${this.url}/group`;
    return super.getCustom(url, { groupId, activityId });
  }

  createTask(taskData) {
    const url = `${this.url}`;
    return super.postCustom(url, taskData);
  }

  getActivitiesByGroup(groupId) {
    const url = `${this.url}activity?GroupID=${groupId}`;
    console.log('url', url);
    return super.getCustom(url, { groupId });
  }

  getUsersByGroup(groupId) {
    const url = `${this.url}group-user?GroupId=${groupId}`;
    console.log('urlUser', url);
    return super.getCustom(url, { groupId });
  }

  updateTaskStatus(taskId, status) {
    const url = `${this.url}/${taskId}`;
    return super.patchCustom(url, { status });
  }
}

export default new TaskAPI('');
