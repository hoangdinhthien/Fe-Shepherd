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

  getTaskById(taskId) {
    const url = `${this.url}/${taskId}`;
    return super.getCustom(url);
  }

  getTasksByGroupAndUser(groupId, userId, activityId) {
    const url = `${this.url}/group/${groupId}/${userId}/${activityId}`;
    return this.getCustom(url);
  }

  updateTaskStatus(taskId, status) {
    const url = `${this.url}/${taskId}`;
    return super.patchCustom(url, { status });
  }
}

export default new TaskAPI('');
