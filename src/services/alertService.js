import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

const ALERT_TTL_MS = 24 * 60 * 60 * 1000;

export async function createAlert(alertData) {
  return addDoc(collection(db, "alerts"), {
    ...alertData,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + ALERT_TTL_MS),
  });
}

export async function cleanupExpiredAlerts() {
  const expiredQuery = query(collection(db, "alerts"), where("expiresAt", "<=", Timestamp.now()));
  const snapshot = await getDocs(expiredQuery);

  if (snapshot.empty) {
    return 0;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach(alertDoc => {
    batch.delete(alertDoc.ref);
  });

  await batch.commit();
  return snapshot.size;
}

export async function getRecentAlerts(maxResults = 5) {
  const recentAlertsQuery = query(
    collection(db, "alerts"),
    orderBy("createdAt", "desc"),
    limit(maxResults),
  );
  const snapshot = await getDocs(recentAlertsQuery);

  return snapshot.docs.map(alertDoc => ({ id: alertDoc.id, ...alertDoc.data() }));
}