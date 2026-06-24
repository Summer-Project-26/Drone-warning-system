import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

export async function syncUserProfile(user, options = {}) {
  const { defaultRole = "user" } = options;
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const existingProfile = snapshot.data();

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? existingProfile.displayName ?? "",
        role: existingProfile.role ?? defaultRole,
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    role: defaultRole,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

export function subscribeUserProfile(uid, onChange) {
  const userRef = doc(db, "users", uid);

  return onSnapshot(userRef, snapshot => {
    if (!snapshot.exists()) {
      onChange(null);
      return;
    }

    onChange({ id: snapshot.id, ...snapshot.data() });
  });
}