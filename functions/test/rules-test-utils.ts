import * as firebase from '@firebase/testing';
import { readFileSync } from 'fs';

const projectId = "firebase-rules-testing";
const rules = readFileSync("../firestore.rules", "utf-8");

export function authedFirestore(userId: string): firebase.firestore.Firestore {
    const auth = { uid: userId }
    return firebase.initializeTestApp({ projectId, auth }).firestore();
}

export async function clearFirestore() {
    firebase.clearFirestoreData({ projectId });
};

export async function loadRules() {
    firebase.loadFirestoreRules({ projectId, rules });
}

export async function clearApps() {
    Promise.all(firebase.apps().map(app => app.delete));
}