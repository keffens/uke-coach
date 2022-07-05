import { useEffect, useState } from "react";
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "firebase/compat/app";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_PROJECT_ID + ".firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_PROJECT_ID + ".appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

let firebaseApp: FirebaseApp | undefined = undefined;

export function initFirebase(): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  // `react-firebaseui` requires the compat mode.
  firebase.initializeApp(firebaseConfig);
  return initializeApp(firebaseConfig);
}

export function useFirebaseUser(onStateChange?: () => any) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    initFirebase();
    // Listen to the Firebase Auth state and set the local state.
    const unregisterAuthObserver = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      if (onStateChange) onStateChange();
    });
    // Make sure we un-register Firebase observers when the component unmounts.
    return () => unregisterAuthObserver();
  }, []);
  return user;
}
