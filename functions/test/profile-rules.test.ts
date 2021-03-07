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

function validProfileData() {
    return {
        url: "url",
        name: "Name"
    }
}

describe("Wader profile security rules", () => {
    it("does not allow reading from other user's profiles", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedFirestore(userId);
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersProfile = otherUser.collection("profiles").doc("profile");

        await firebase.assertFails(otherUsersProfile.get());
    });

    it("does not allow riting to other user's profiles", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedFirestore(userId);
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersProfile = otherUser.collection("profiles").doc("profile");

        await firebase.assertFails(otherUsersProfile.set(validProfileData()));
    });

    it("allows reading from the current user's profiles", async() => {
        const userId = "someone";

        const db = authedFirestore(userId);
        const user = db.collection("users").doc(userId);
        const profile = user.collection("profiles").doc("profile");

        await firebase.assertSucceeds(profile.get());
    });

    it("allows writing to the current user's profiles", async() => {
        const userId = "someone";

        const db = authedFirestore(userId);
        const user = db.collection("users").doc(userId);
        const profile = user.collection("profiles").doc("profile");

        await firebase.assertSucceeds(profile.set(validProfileData()));
    });

    it("does not allow creating a profile without an url", async() => {
        const userId = "someone";
        const profileData: any = validProfileData();
        delete profileData.url;

        const db = authedFirestore(userId);
        const user = db.collection("users").doc(userId);
        const profile = user.collection("profiles").doc("profile");

        await firebase.assertFails(profile.set(profileData));
    });

    it("does not allow creating a profile with an empty url", async() => {
        const userId = "someone";
        const profileData = validProfileData();
        profileData.url = "";

        const db = authedFirestore(userId);
        const user = db.collection("users").doc(userId);
        const profile = user.collection("profiles").doc("profile");

        await firebase.assertFails(profile.set(profileData));
    });
});