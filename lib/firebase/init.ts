import { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_PROJECT_ID + ".firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_PROJECT_ID + ".appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

export function initFirebase() {
  firebase.initializeApp(firebaseConfig);
}

export function useFirebaseUser(onStateChange: () => any) {
  const [user, setUser] = useState<firebase.User | null>(null);
  useEffect(() => {
    initFirebase();
    // Listen to the Firebase Auth state and set the local state.
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((u) => {
      setUser(u);
      onStateChange();
    });
    // Make sure we un-register Firebase observers when the component unmounts.
    return () => unregisterAuthObserver();
  }, []);
  return user;
}
