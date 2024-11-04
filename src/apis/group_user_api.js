import { sup } from "framer-motion/client";
import BaseAPI from "../config/baseAPI";
import axiosClient from "../config/axios";

class GroupUserAPI extends BaseAPI {
  constructor() {
    super("group-user");
  }

  getGroupMembers(groupId) {
    return super.getAll({ groupId });
  }
}

export default new GroupUserAPI();