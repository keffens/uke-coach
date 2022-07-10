import admin, { ServiceAccount } from "firebase-admin";
import { NextApiRequest } from "next";
import { Unauthorized } from "./error";

const adminConfig: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

export function initFirebaseAdmin() {
  if (admin.apps?.length) return; // Only sign in once.
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
}

export async function authenticateUser(
  reqOrToken: NextApiRequest | string
): Promise<string> {
  try {
    let idToken;
    if (typeof reqOrToken === "string") {
      idToken = reqOrToken;
    } else {
      idToken = (await JSON.parse(reqOrToken.body)).idToken;
    }
    const token = await admin.auth().verifyIdToken(idToken);
    return token.uid;
  } catch {
    throw new Unauthorized("Failed to authenticate the user");
  }
}
