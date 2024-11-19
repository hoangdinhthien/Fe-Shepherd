import BaseAPI from '../config/baseAPI';

class TaskAPI extends BaseAPI {
  getTasksByGroup(groupId) {
    const url = `${this.url}task/group`;
    return super.getCustom(url, { groupId });
  }

  createTask(taskData) {
    const url = `${this.url}task/create`; // hoặc endpoint phù hợp cho tạo công việc
    return super.post(url, taskData);
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

  // // Chấp nhận công việc
  // acceptTask(taskId) {
  //   const url = `${this.url}/${taskId}/accept`; // Endpoint cho chấp nhận công việc
  //   return super.post(url); // Giả định rằng phương thức chấp nhận không yêu cầu thêm dữ liệu trong phần body
  // }

  // // Từ chối công việc (nếu cần)
  // rejectTask(taskId) {
  //   const url = `${this.url}/${taskId}/reject`; // Endpoint cho từ chối công việc
  //   return super.post(url); // Giả định rằng phương thức từ chối không yêu cầu thêm dữ liệu trong phần body
  // }
}

export default new TaskAPI('');
