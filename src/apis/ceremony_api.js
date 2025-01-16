import BaseAPI from '../config/baseAPI';

class CeremoniesAPI extends BaseAPI {
  getAllCeremonies(fromDate) {
    const url = `/ceremony/calendar?ChosenDate=${encodeURIComponent(
      fromDate
    )}&CalendarTypeEnum=1`;
    return this.getCustom(url);
  }
}
export default new CeremoniesAPI();
