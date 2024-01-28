// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {StorageReference, getDownloadURL, getStorage} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey           : import.meta.env.VITE_REACT_APIKEY,
  authDomain       : import.meta.env.VITE_REACT_AUTHDOMAIN,
  projectId        : import.meta.env.VITE_REACT_PROJECTID,
  storageBucket    : import.meta.env.VITE_REACT_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_MESSENGINGSENDERID,
  appId            : import.meta.env.VITE_VITE_REACT_APPIDREACT_APIKEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function getImage(reference: StorageReference) {
  try {
    return await getDownloadURL(reference);
  } catch (error) {
    return "../src/assets/images/avatar.png";
  }
}