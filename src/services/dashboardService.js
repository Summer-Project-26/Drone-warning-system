import { Timestamp, collection, getCountFromServer, query, where } from "firebase/firestore";

import { db } from "./firebase";

const DASHBOARD_COLLECTIONS = ["users", "alerts", "reports", "feedback"];

async function getCollectionCount(collectionName) {
  const snapshot = await getCountFromServer(collection(db, collectionName));
  return snapshot.data().count;
}

async function getAlertCount(operator) {
  const snapshot = await getCountFromServer(
    query(collection(db, "alerts"), where("expiresAt", operator, Timestamp.now())),
  );

  return snapshot.data().count;
}

export async function getDashboardStats() {
  const [users, reports, feedback, activeAlerts, expiredAlerts] = await Promise.all([
    getCollectionCount(DASHBOARD_COLLECTIONS[0]),
    getCollectionCount(DASHBOARD_COLLECTIONS[2]),
    getCollectionCount(DASHBOARD_COLLECTIONS[3]),
    getAlertCount(">"),
    getAlertCount("<="),
  ]);

  return { users, activeAlerts, expiredAlerts, reports, feedback };
}