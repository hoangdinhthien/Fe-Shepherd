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
}

export default new EventAPI('event');
// export default new EventAPI('event'); // why new EventAPI ? => instance of EventAPI if use constructor
