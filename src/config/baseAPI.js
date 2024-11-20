import axiosClient from './axios';

class BaseAPI {
  constructor(url) {
    this.url = url;
  }

  // append form data
  appendFormData(data) {
    return data;
    // const formData = new FormData();
    // Object.keys(data).forEach((key) => formData.append(key, data[key]));
    // return formData;
  }

  // handle request
  async handleRequest(request, getDataKey = true) {
    try {
      const response = await request;
      if (typeof response !== 'object' || response === null) {
        throw new Error('Response target must be an object');
      }
      if (response.status === 200) {
        if (!(response?.data?.success ?? true)) {
          throw new Error(response.data?.message || 'Request failed');
        }
        // Use customResponseKey if provided; otherwise, return response.data
        return getDataKey ? response.data : response;
      } else {
        console.error('API Error:', response);
        throw new Error(
          'Request failed with status ' + response.status + response.statusText
        );
      }
    } catch (error) {
      // Log the entire error for debugging
      console.error('API Error:', error.response || error.message);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'An unknown error occurred'
      );
    }
  }

  //----------------------------DEFAULT CRUD----------------------------

  getAll(params, getDataKey = true) {
    return this.handleRequest(
      axiosClient.get(this.url, { params }),
      getDataKey
    );
  }

  getById(id, getDataKey = true) {
    return this.handleRequest(axiosClient.get(`${this.url}/${id}`), getDataKey);
  }

  create(
    data,
    config = { headers: { 'Content-Type': 'application/json' } },
    getDataKey = true
  ) {
    return this.handleRequest(
      axiosClient.post(this.url, this.appendFormData(data), config),
      getDataKey
    );
  }

  update(
    data,
    config = { headers: { 'Content-Type': 'application/json' } },
    getDataKey = true
  ) {
    return this.handleRequest(
      axiosClient.put(this.url, this.appendFormData(data), config),
      getDataKey
    );
  }

  delete(id, getDataKey = true) {
    return this.handleRequest(
      axiosClient.delete(`${this.url}/${id}`),
      getDataKey
    );
  }

  //------------------------------CUSTOM------------------------------

  getCustom(url, params, getDataKey = true) {
    return this.handleRequest(axiosClient.get(url, { params }), getDataKey);
  }

  postCustom(
    url,
    data,
    config = { headers: { 'Content-Type': 'application/json' } },
    getDataKey = true
  ) {
    return this.handleRequest(
      axiosClient.post(url, this.appendFormData(data), config),
      getDataKey
    );
  }

  putCustom(
    url,
    data,
    config = { headers: { 'Content-Type': 'application/json' } },
    getDataKey = true
  ) {
    return this.handleRequest(
      // axiosClient.put(url, this.appendFormData(data), config),
      axiosClient.put(url, data, config),
      getDataKey
    );
  }

  deleteCustom(url, id = null, getDataKey = true) {
    if (id === null) {
      return this.handleRequest(axiosClient.delete(url), getDataKey);
    }
    return this.handleRequest(
      axiosClient.delete(`${this.url}/${id}`),
      getDataKey
    );
  }
}

export default BaseAPI;
