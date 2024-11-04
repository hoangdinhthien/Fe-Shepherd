import axiosClient from '../config/axios';
import BaseAPI from '../config/baseAPI';

class EventAPI extends BaseAPI {
  // Existing method to fetch events by group and date
  getEventsByGroupAndDate(
    chosenDate,
    groupId,
    calendarTypeEnum = 1,
    userOnly = false,
    getUpcoming = false
  ) {
    return this.handleRequest(
      axiosClient.get(`event/calendar`, {
        params: {
          ChosenDate: chosenDate,
          GroupId: groupId,
          CalendarTypeEnum: calendarTypeEnum,
          UserOnly: userOnly,
          GetUpcoming: getUpcoming,
        },
      })
    );
  }

  // New method to fetch events by group without date
  getEventsByGroup(groupId) {
    return this.handleRequest(
      axiosClient.get(`event/calendar`, {
        params: {
          GroupId: groupId,
        },
      })
    );
  }
}

export default new EventAPI();
