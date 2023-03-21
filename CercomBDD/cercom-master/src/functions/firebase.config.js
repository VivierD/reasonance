import { initializeApp } from "firebase/app";
import { combineReducers } from "redux";
import { firebaseReducer } from "react-redux-firebase"
import { firestoreReducer } from "redux-firestore"
 
export const firebaseConfig = {
  apiKey: "AIzaSyAMds9Pds-muDC95GCfv38B7S-RjrVwpJY",
  authDomain: "cercom-81167.firebaseapp.com",
  projectId: "cercom-81167",
  storageBucket: "cercom-81167.appspot.com",
  messagingSenderId: "111247347432",
  appId: "1:111247347432:web:1b50b7f57d9dcf0cab835d"
};

export const firebaseapp = initializeApp(firebaseConfig);

export const rootReducer = combineReducers({
    firebase : firebaseReducer,
    firestore : firestoreReducer
})