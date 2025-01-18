const storageKeys = {
  ACCESS_KEY: 'token',
  ACCOUNT_KEY: 'account',
  USER_KEY: 'currentUser',
};

const storageService = {
  setAccessToken(token) {
    localStorage.setItem(storageKeys.ACCESS_KEY, token);
  },

  getAccessToken() {
    return localStorage.getItem(storageKeys.ACCESS_KEY);
  },

  removeAccessToken() {
    localStorage.removeItem(storageKeys.ACCESS_KEY);
  },

  setCurrentUser(user) {
    localStorage.setItem(storageKeys.USER_KEY, JSON.stringify(user));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(storageKeys.USER_KEY));
  },

  removeCurrentUser() {
    localStorage.removeItem(storageKeys.USER_KEY);
  },
};

export default storageService;
