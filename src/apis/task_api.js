import BaseAPI from '../config/baseAPI';

class TaskAPI extends BaseAPI {

    getTasksByGroup(groupId) {
        const url = `${this.url}/group`;
        return super.getCustom(url, { groupId });
    }
}

export default new TaskAPI('task');
