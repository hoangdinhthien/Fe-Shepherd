import BaseAPI from '../../config/baseAPI';

class AdminCalendarAPI extends BaseAPI {
  getAllCeremonies() {
    const url = '/ceremony/calendar';
    return this.getCustom(url);
  }

  getAllCeremoniesToEdit() {
    const url = '/ceremony';
    return this.getCustom(url);
  }

  getCeremonyById(ceremonyId) {
    const url = `/ceremony?SearchKey=${ceremonyId}`;
    return this.getCustom(url);
  }

  updateCeremony(ceremonyId, data) {
    const url = `/ceremony/${ceremonyId}`;
    return this.putCustom(url, data);
  }

  getTimeSlotById(timeSlotId) {
    const url = `/time-slot?SearchKey=${timeSlotId}`;
    return this.getCustom(url);
  }

  getAllTimeSlots() {
    const url = '/time-slot';
    return this.getCustom(url);
  }
}

export default new AdminCalendarAPI();
