import BaseAPI from "../config/baseAPI";

class AuthAPI extends BaseAPI {
    constructor() {
        super('Login');
    }

    login(data) {
        return super.create(data);
    }
}

export default new AuthAPI;