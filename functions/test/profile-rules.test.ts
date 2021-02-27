import * as firebase from '@firebase/testing';
import { readFileSync } from 'fs';

const projectId = "wader-profile-testing";
const rules = readFileSync("../firestore.rules", "utf-8");

function authedFirestore(userId: string): firebase.firestore.Firestore {
    const auth = { uid: userId }
    return firebase.initializeTestApp({ projectId, auth }).firestore();
}

beforeEach(async () => {
    await firebase.clearFirestoreData({ projectId });
});

before(async () => {
    await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
});

/*
function validProfile() {
    return {
        url: "url",
        name: "Name"
    }
}
*/

describe("Wader profile security rules", () => {
    it("does not allow reading from other user's profiles", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedFirestore(userId);
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersProfile = otherUser.collection("profiles").doc("profile");

        await firebase.assertFails(otherUsersProfile.get());
    });
});