import BaseAPI from "../config/baseAPI";

class DeviceAPI extends BaseAPI {
    constructor() {
        super('user-device');
    }
}

export default new DeviceAPI();