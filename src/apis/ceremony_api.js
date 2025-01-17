import BaseAPI from '../config/baseAPI';

class CeremoniesAPI extends BaseAPI {
  constructor() {
    super('ceremony');
  }

  getAllCeremonies(fromDate) {
    const url = `/ceremony/calendar?ChosenDate=${encodeURIComponent(
      fromDate
    )}&CalendarTypeEnum=1`;
    return this.getCustom(url);
  }

  getCeremonies(params) {
    const url = `${this.url}/calendar`;
    return super.getCustom(url, { params });
  }
}
export default new CeremoniesAPI();
