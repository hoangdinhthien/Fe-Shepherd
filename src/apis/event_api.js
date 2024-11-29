import BaseAPI from '../config/baseAPI';

class EventAPI extends BaseAPI {
  constructor() {
    super('event');
  }

  getEventsByGroup(params) {
    const url = `${this.url}/calendar`; // => axios => base url + event/calendar (custom url)
    return super.getCustom(url, params); // => shortcut
  }

  getEvents(params) {
    return super.getAll(params);
  }

  // task
  getEventsByGroupForTask(groupId) {
    const url = `${this.url}?GroupId=${groupId}`;
    return super.getCustom(url);
  }

  // Location
  getLocations() {
    const url = `${this.url}/Locations`;
    return super.getCustom(url);
  }
}

export default new EventAPI('event');
// export default new EventAPI('event'); // why new EventAPI ? => instance of EventAPI if use constructor
