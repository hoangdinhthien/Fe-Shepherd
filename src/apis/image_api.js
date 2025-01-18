import BaseAPI from '../config/baseAPI';

class ImageAPI extends BaseAPI {
  constructor() {
    super('image');
  }

  uploadImageMultipart(file) {
    const data = new FormData();
    data.append('file', file);
    const endpoint = `${this.url}/Upload`;
    return this.postCustom(endpoint, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}


export default new ImageAPI();
