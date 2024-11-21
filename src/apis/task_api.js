import BaseAPI from '../config/baseAPI';

class TaskAPI extends BaseAPI {
  getTasksByGroup(groupId) {
    const url = `${this.url}task/group`;
    return super.getCustom(url, { groupId });
  }

  createTask(taskData) {
    const url = `${this.url}task`;
    return super.postCustom(url, taskData);
  }

  getTaskById(taskId) {
    const url = `${this.url}task/${taskId}`;
    return super.getCustom(url);
  }

  getTasksByGroupAndUser(groupId, userId) {
    const url = `${this.url}task/group`;
    return super.getCustom(url, { groupId, userId });
  }

  updateTaskStatus(taskId, status) {
    const url = `${this.url}task/${taskId}`;
    return super.patchCustom(url, { status });
  }
}

export default new TaskAPI('');
