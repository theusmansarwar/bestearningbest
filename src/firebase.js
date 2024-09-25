import { initializeApp } from 'firebase/app';

import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage
import { getDatabase, ref,set, get, query, equalTo, orderByChild } from 'firebase/database';
const firebaseConfig = {
    apiKey: "AIzaSyB_YnmiVfAYvS6fzfddunJR2ctUw1XS7WI",
    authDomain: "earningweb-20e86.firebaseapp.com",
    projectId: "earningweb-20e86",
    storageBucket: "earningweb-20e86.appspot.com",
    messagingSenderId: "231872649318",
    appId: "1:231872649318:web:e35ebbce6faf383c81b5a7"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage
const signOut = () => firebaseSignOut(auth); 

export { auth, app,database,storage, ref,signOut, get, set, query, equalTo, orderByChild };