import { useState, ChangeEvent } from "react";
import { FaGuitar } from "react-icons/fa";
import { useFirebaseUser } from "../lib/firebase";
import "firebase/compat/auth";
import { getAuth, signOut, updateProfile, User } from "firebase/auth";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import FirebaseAuth from "./FirebaseAuth";

const NAVBAR_HEIGHT = "64px";
export const NAVBAR_STICKY_HEIGHT = { xs: 0, sm: NAVBAR_HEIGHT };

interface UserButtonProps {
  isLoading: boolean;
  onClick: () => void;
  user: User | null;
}

function UserButton({ isLoading, onClick, user }: UserButtonProps) {
  let avatar = <AccountCircle fontSize="inherit" />;
  let toolTip = "Sign in";
  let sx = {};
  if (user) {
    toolTip = "User settings";
    if (user.photoURL) {
      avatar = (
        <Avatar alt={user.displayName || "your avatar"} src={user.photoURL} />
      );
      sx = { p: 0, outline: "solid white 2px" };
    }
  }
  // The span wrapper is necessary because the Tooltip cannot wrap a disabled
  // button.
  return (
    <Tooltip title={toolTip}>
      <span>
        <IconButton
          disabled={isLoading}
          color="inherit"
          onClick={onClick}
          size="large"
          sx={sx}
        >
          {avatar}
        </IconButton>
      </span>
    </Tooltip>
  );
}

interface SignInDialogProps {
  closeDialog: () => void;
  user: User | null;
}

function SignInDialog({ closeDialog, user }: SignInDialogProps) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  return (
    <Dialog
      disableScrollLock={true}
      open
      onClose={closeDialog}
      sx={{ minWidth: "320px" }}
    >
      <DialogTitle>
        {user
          ? `You're signed in as ${user.displayName}`
          : "Register or sign in"}
      </DialogTitle>
      <DialogContent sx={{ minWidth: { sm: "480px" } }}>
        <DialogContentText>
          {user ? (
            <Box component="form" pt={1}>
              <TextField
                error={!displayName.trim()}
                fullWidth
                label="Display name"
                type="text"
                value={displayName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDisplayName(e.target.value)
                }
              />
            </Box>
          ) : (
            <FirebaseAuth />
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {user && (
          <>
            <Button
              disabled={!displayName || displayName.trim() === user.displayName}
              onClick={() => {
                updateProfile(user, { displayName: displayName.trim() });
                closeDialog();
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                signOut(getAuth());
                closeDialog();
              }}
            >
              Sign out
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
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
      <AppBar
        sx={{
          position: { color: "#fff", xs: "relative", sm: "sticky" },
        }}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters={false} sx={{ height: NAVBAR_HEIGHT }}>
            <IconButton
              color="inherit"
              href="/"
              size="large"
              sx={{ mr: 2, ":hover": { color: "inherit" } }}
            >
              <FaGuitar />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                display: { xs: "none", sm: "flex" },
                letterSpacing: ".1rem",
                color: "inherit",
                textDecoration: "none",
                ":hover": { color: "inherit" },
              }}
            >
              Uke Coach
            </Typography>

            <Box sx={{ flexGrow: 1 }}> </Box>

            <Box sx={{ flexGrow: 0 }}>
              <UserButton
                onClick={() => openSignInDialog(true)}
                isLoading={isLoading}
                user={user}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {showSignInDialog && (
        <SignInDialog user={user} closeDialog={() => openSignInDialog(false)} />
      )}
    </>
  );
}
