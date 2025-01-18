import BaseAPI from '../config/baseAPI';

class ImageAPI extends BaseAPI {
  constructor() {
    super('image');
  }

  uploadImageMultipart(file) {
    const data = new FormData();
    data.append('image', file);
    const endpoint = `${this.url}/Upload`;
    return this.putCustom(endpoint, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}


export default new ImageAPI();
