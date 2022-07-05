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
import { Field } from "bloomer/lib/elements/Form/Field/Field";
import { Label } from "bloomer/lib/elements/Form/Label";
import { Control } from "bloomer/lib/elements/Form/Control";
import { Input } from "bloomer/lib/elements/Form/Input";
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";

interface UserButtonProps {
  isLoading: boolean;
  onClick: () => void;
  user: User | null;
}

function UserButton({ isLoading, onClick, user }: UserButtonProps) {
  let icon = <TbUserOff className="icon" />;
  if (user) {
    if (user.photoURL) {
      icon = (
        <img
          src={user.photoURL}
          style={{ minWidth: "36px", minHeight: "36px", borderRadius: "18px" }}
        ></img>
      );
    } else {
      icon = <TbUser className="icon" />;
    }
  }

  return (
    <Button
      className="is-rounded"
      style={{ height: "40px", width: "40px", padding: 0 }}
      onClick={onClick}
      isLoading={isLoading}
    >
      {icon}
    </Button>
  );
}

interface SignInDialogProps {
  closeDialog: () => void;
  user: User | null;
}

function SignInDialog({ closeDialog, user }: SignInDialogProps) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");

  // Configure FirebaseUI.
  const uiConfig = {
    signInFlow: "popup",
    // signInSuccess: closeDialog,
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      GoogleAuthProvider.PROVIDER_ID,
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
          <ModalCardTitle>
            {user
              ? `You're signed in as ${user.displayName}`
              : "Register or sign in"}
          </ModalCardTitle>
          <Delete onClick={closeDialog} />
        </ModalCardHeader>
        <ModalCardBody>
          {user ? (
            <>
              <Field>
                <Label>Display name</Label>
                <Control>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName((e.target as HTMLInputElement).value)
                    }
                  />
                </Control>
              </Field>
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
            <>
              <Button
                isColor="primary"
                disabled={
                  !displayName || displayName.trim() === user.displayName
                }
                onClick={() => {
                  updateProfile(user, { displayName: displayName.trim() });
                  closeDialog();
                }}
              >
                save
              </Button>
              <Button
                onClick={() => {
                  signOut(getAuth());
                  closeDialog();
                }}
              >
                sign out
              </Button>
            </>
          )}
        </ModalCardFooter>
      </ModalCard>
    </Modal>
  );
}

export default function NavbarComponent() {
  const [isLoading, setLoading] = useState(true);
  const [showSignInDialog, openSignInDialog] = useState(false);
  const user = useFirebaseUser(() => {
    openSignInDialog(false);
    setLoading(false);
  });

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
              isLoading={isLoading}
              user={user}
            />
          </NavbarItem>
        </NavbarBrand>
        <NavbarMenu isActive={false}>
          <NavbarEnd>
            <NavbarItem>
              <UserButton
                onClick={() => openSignInDialog(true)}
                isLoading={isLoading}
                user={user}
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
