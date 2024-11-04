import { sup } from 'framer-motion/client';
import axiosClient from '../config/axios';
import BaseAPI from '../config/baseAPI';

class GroupAPI extends BaseAPI {
  // Get all groups for the current user by passing userId as a parameter
  getGroupsForUser(userId) {
    return super.getAll({ userId });
  }
}

export default new GroupAPI('group');
