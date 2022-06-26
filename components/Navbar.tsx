import { Navbar, NavbarBrand, NavbarEnd, NavbarItem } from "bloomer";
import { NavbarMenu } from "bloomer/lib/components/Navbar/NavbarMenu";
import { Button } from "bloomer/lib/elements/Button";
import { useState } from "react";
import { FaGuitar } from "react-icons/fa";
import { TbUser, TbUserOff } from "react-icons/tb";
import { useFirebaseUser } from "../lib/firebase";
import styles from "./Navbar.module.scss";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { Modal } from "bloomer/lib/components/Modal/Modal";
import { ModalBackground } from "bloomer/lib/components/Modal/ModalBackground";
import { ModalCard } from "bloomer/lib/components/Modal/Card/ModalCard";
import { ModalCardHeader } from "bloomer/lib/components/Modal/Card/ModalCardHeader";
import { ModalCardTitle } from "bloomer/lib/components/Modal/Card/ModalCardTitle";
import { Delete } from "bloomer/lib/elements/Delete";
import { ModalCardBody } from "bloomer/lib/components/Modal/Card/ModalCardBody";
import { ModalCardFooter } from "bloomer/lib/components/Modal/Card/ModalCardFooter";

interface UserButtonProps {
  onClick: () => void;
  isSignedIn: boolean;
}

function UserButton({ onClick, isSignedIn }: UserButtonProps) {
  return (
    <Button
      className="is-rounded"
      style={{ padding: "0 1em" }}
      onClick={onClick}
    >
      {isSignedIn ? (
        <TbUser className="icon" />
      ) : (
        <TbUserOff className="icon" />
      )}
    </Button>
  );
}

interface SignInDialogProps {
  user: firebase.User | null;
  closeDialog: () => void;
}

function SignInDialog({ user, closeDialog }: SignInDialogProps) {
  // Configure FirebaseUI.
  const uiConfig = {
    signInFlow: "popup",
    // signInSuccess: closeDialog,
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
  };

  return (
    <Modal isActive>
      <ModalBackground />
      <ModalCard>
        <ModalCardHeader>
          <ModalCardTitle>Sign in</ModalCardTitle>
          <Delete onClick={closeDialog} />
        </ModalCardHeader>
        <ModalCardBody>
          {user ? (
            <>
              You're logged in as <b>{user.displayName}</b>.
            </>
          ) : (
            <StyledFirebaseAuth
              uiConfig={uiConfig}
              firebaseAuth={firebase.auth()}
            />
          )}
        </ModalCardBody>
        <ModalCardFooter>
          {user && (
            <Button
              onClick={() => {
                firebase.auth().signOut();
                closeDialog();
              }}
            >
              sign out
            </Button>
          )}
        </ModalCardFooter>
      </ModalCard>
    </Modal>
  );
}

export default function NavbarComponent() {
  const [showSignInDialog, openSignInDialog] = useState(false);
  const user = useFirebaseUser(() => openSignInDialog(false));

  return (
    <>
      <Navbar className={styles.navbar}>
        <NavbarBrand>
          <NavbarItem>
            <FaGuitar className="mr-2" />
            <b>Uke Coach</b>
          </NavbarItem>
          <NavbarItem isHidden="desktop" style={{ flexGrow: 1 }}></NavbarItem>
          <NavbarItem isHidden="desktop">
            <UserButton
              onClick={() => openSignInDialog(true)}
              isSignedIn={!!user}
            />
          </NavbarItem>
        </NavbarBrand>
        <NavbarMenu isActive={false}>
          <NavbarEnd>
            <NavbarItem>
              <UserButton
                onClick={() => openSignInDialog(true)}
                isSignedIn={!!user}
              />
            </NavbarItem>
          </NavbarEnd>
        </NavbarMenu>
      </Navbar>
      {showSignInDialog && (
        <SignInDialog user={user} closeDialog={() => openSignInDialog(false)} />
      )}
    </>
  );
}
