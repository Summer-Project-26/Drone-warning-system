import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";
import { syncUserProfile } from "./userService";

export async function signupUser(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await syncUserProfile(credential.user, { defaultRole: "user" });
  return credential;
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await syncUserProfile(credential.user, { defaultRole: "user" });
  return credential;
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function logoutUser() {
  return signOut(auth);
}