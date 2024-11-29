import BaseAPI from '../config/baseAPI';

class TaskAPI extends BaseAPI {
  constructor() {
    super('task');
  }

  // Fetch tasks by group
  getTasksByGroup(groupId, activityId) {
    const url = `${this.url}/group?GroupId=${groupId}`;
    return this.getCustom(url, { activityId });
  }

  // Fetch tasks by group and user
  getTasksByGroupAndUser(groupId, userId, activityId) {
    const url = `${this.url}/group?GroupId=${groupId}&UserId=${userId}`;
    return this.getCustom(url, { activityId });
  }

  // Update task status
  updateTaskStatus(taskId, status) {
    const url = `${this.url}/${taskId}/status`;
    return this.putCustom(url, { status });
  }

  // create a new task
  createTask(data) {
    return this.postCustom(this.url, data);
  }
}

export default new TaskAPI();
