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

  createTask(taskData) {
    const url = `${this.url}`;
    return super.postCustom(url, taskData);
  }

  getTasksByGroupAndUser(groupId, userId, activityId) {
    const url = `${this.url}/group?GroupId=${groupId}&ActivityId=${activityId}&UserId=${userId}`;
    return this.getCustom(url, { userId, activityId });
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

  // Update task's status
  updateTaskStatus(taskId, status) {
    const url = `${this.url}/${taskId}/status`;
    return this.putCustom(url, { status });
  }

  // Update hole task
  updateTask(taskId, taskData) {
    const url = `${this.url}/${taskId}`;
    return this.putCustom(url, taskData);
  }
}

export default new TaskAPI();
