import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";

import { auth, db, storage } from "./firebase";
import { evaluateCredibility } from "./credibilityEngine";

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

const MAX_ACTIVE_ALERTS_FETCH = 200;

export async function fetchAlerts() {
  const activeAlertsQuery = query(
    collection(db, "alerts"),
    orderBy("createdAt", "desc"),
    limit(MAX_ACTIVE_ALERTS_FETCH),
  );
  const snapshot = await getDocs(activeAlertsQuery);
  const now = Timestamp.now();

  return snapshot.docs
    .map(alertDoc => ({ id: alertDoc.id, ...alertDoc.data() }))
    .filter(alert => !alert.expiresAt || alert.expiresAt.toMillis() > now.toMillis());
}

async function fetchActiveAlertsForCredibilityCheck() {
  return fetchAlerts();
}

export async function uploadAlertPhoto(localUri, alertId) {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const photoRef = ref(storage, `alerts/${alertId}.jpg`);
  await uploadBytes(photoRef, blob);

  return getDownloadURL(photoRef);
}

export async function submitAlert(input) {
  const { category, description, latitude, longitude, localImageUri } = input;

  if (!category) {
    throw new Error("An alert category is required.");
  }
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("A valid location is required.");
  }

  const userId = auth.currentUser?.uid ?? "anonymous";

  const alertRef = doc(collection(db, "alerts"));

  let imageUrl = null;
  if (localImageUri) {
    try {
      imageUrl = await uploadAlertPhoto(localImageUri, alertRef.id);
    } catch {
      imageUrl = null;
    }
  }

  const existingAlerts = await fetchActiveAlertsForCredibilityCheck();
  const credibility = evaluateCredibility({ category, latitude, longitude }, existingAlerts);

  const now = Date.now();
  const newAlert = {
    id: alertRef.id,
    category,
    description: description ?? "",
    imageUrl,
    latitude,
    longitude,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(now + ALERT_TTL_MS),
    confirmations: credibility.confirmations,
    verified: credibility.verified,
    level: credibility.level,
    userId,
    emergencySound: credibility.emergencySound,
  };

  await setDoc(alertRef, newAlert);

  if (credibility.matchedAlertIds.length > 0) {
    const batch = writeBatch(db);
    credibility.matchedAlertIds.forEach(matchedId => {
      batch.update(doc(db, "alerts", matchedId), {
        confirmations: credibility.confirmations,
        verified: credibility.verified,
        level: credibility.level,
        emergencySound: credibility.emergencySound,
      });
    });
    await batch.commit();
  }

  return {
    id: alertRef.id,
    level: credibility.level,
    confirmations: credibility.confirmations,
    emergencySound: credibility.emergencySound,
  };
}