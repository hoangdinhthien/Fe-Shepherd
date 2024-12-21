// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getMessaging } from 'firebase/messaging';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'shepherd-1f1c9.firebaseapp.com',
  projectId: 'shepherd-1f1c9',
  storageBucket: 'shepherd-1f1c9.appspot.com',
  messagingSenderId: '1047331650888',
  appId: '1:1047331650888:web:d1d35acc9a8e723fed477d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//  Messaging service
export const messaging = getMessaging(app);