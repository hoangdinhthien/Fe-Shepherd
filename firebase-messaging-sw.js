importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: 'AIzaSyCgU52gE-of9tEbcxJ-cUB9E6TMt_IAzRU',
    authDomain: 'shepherd-1f1c9.firebaseapp.com',
    projectId: 'shepherd-1f1c9',
    storageBucket: 'shepherd-1f1c9.appspot.com',
    messagingSenderId: '1047331650888',
    appId: '1:1047331650888:web:d1d35acc9a8e723fed477d',
};


firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// Customize background notification handling here
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});