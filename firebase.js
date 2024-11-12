// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuCD7NiTOjDUac7y8J65lcDWMVUSrmDsc",
  authDomain: "nahwagtang.firebaseapp.com",
  databaseURL: "https://nahwagtang-default-rtdb.firebaseio.com", // Correct Database URL
  projectId: "nahwagtang",
  storageBucket: "nahwagtang.appspot.com", // Corrected Storage URL
  messagingSenderId: "891359115700",
  appId: "1:891359115700:web:55a9d8c7ec47bea4575ae1",
  measurementId: "G-SE3SN19VR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Realtime Database
const database = getDatabase(app);

export { auth, database };