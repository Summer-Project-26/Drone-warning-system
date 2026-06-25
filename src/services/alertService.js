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
const MAX_BATCH_DELETE_SIZE = 500;

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

  let deletedCount = 0;

  for (let index = 0; index < snapshot.docs.length; index += MAX_BATCH_DELETE_SIZE) {
    const batch = writeBatch(db);
    const docsToDelete = snapshot.docs.slice(index, index + MAX_BATCH_DELETE_SIZE);

    docsToDelete.forEach(alertDoc => {
      batch.delete(alertDoc.ref);
    });

    await batch.commit();
    deletedCount += docsToDelete.length;
  }

  return deletedCount;
}

export async function getRecentAlerts(maxResults = 5) {
  const recentAlertsQuery = query(
    collection(db, "alerts"),
    orderBy("createdAt", "desc"),
    limit(Math.max(maxResults * 3, maxResults)),
  );
  const snapshot = await getDocs(recentAlertsQuery);
  const now = Timestamp.now();

  return snapshot.docs
    .map(alertDoc => ({ id: alertDoc.id, ...alertDoc.data() }))
    .filter(alert => !alert.expiresAt || alert.expiresAt.toMillis() > now.toMillis())
    .slice(0, maxResults);
}