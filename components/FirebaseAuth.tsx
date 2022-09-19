import { getAuth, GoogleAuthProvider } from "firebase/auth";
import "firebaseui/dist/firebaseui.css";
import { useEffect } from "react";

// Configure FirebaseUI.
const CONFIG = {
  signInFlow: "popup",
  // privacyPolicyUrl: "",
  // signInSuccess: closeDialog,
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
    // FacebookAuthProvider.PROVIDER_ID,
    // TwitterAuthProvider.PROVIDER_ID,
    // EmailAuthProvider.PROVIDER_ID,
  ],
};

export default function FirebaseAuth() {
  const initialize = async () => {
    // delay the import until window object is ready
    const firebaseui = await import("firebaseui");
    const ui =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(getAuth());
    ui.start("#firebase-auth-container", CONFIG);
  };

  useEffect(() => {
    initialize();
  });
  return <div id="firebase-auth-container" />;
}
