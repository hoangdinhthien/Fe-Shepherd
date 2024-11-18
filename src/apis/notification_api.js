import BaseAPI from "../config/baseAPI";

class NotificationAPI extends BaseAPI {
    constructor() {
        super("notification");
    }
    
    getNotifications(params) {
        return super.getAll(params);
    }
}

export default new NotificationAPI;