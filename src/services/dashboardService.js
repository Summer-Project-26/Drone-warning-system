import { collection, getDocs } from "firebase/firestore";

import { db } from "./firebase";

const DASHBOARD_COLLECTIONS = ["users", "alerts", "reports", "feedback"];

async function getCollectionCount(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.size;
}

export async function getDashboardStats() {
  const [users, alerts, reports, feedback] = await Promise.all(
    DASHBOARD_COLLECTIONS.map(collectionName => getCollectionCount(collectionName)),
  );

  return { users, alerts, reports, feedback };
}