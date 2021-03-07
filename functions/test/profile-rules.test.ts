import * as firebase from '@firebase/testing';
import * as ruleTestUtils from './rules-test-utils';

beforeEach(async () => {
    await ruleTestUtils.clearFirestore();
});

before(async () => {
    await ruleTestUtils.loadRules();
});

after(async () => {
    await ruleTestUtils.clearApps();
});

function validProfileData() {
    return {
        url: "url",
        name: "Name"
    }
}

function profileDocument(userId: string) {
    const database = ruleTestUtils.authedFirestore(userId);
    return profileDocumentForDatabase(userId, database);
}

function profileDocumentForDatabase(userId: string, database: firebase.firestore.Firestore) {
    const userDoc = database.collection("users").doc(userId);
    return userDoc.collection("profiles").doc("profile");
}

describe("Wader profile security rules", () => {
    it("does not allow reading from other user's profiles", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersProfile = profileDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersProfile.get());
    });

    it("does not allow writing to other user's profiles", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersProfile = profileDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersProfile.set(validProfileData()));
    });

    it("allows reading from the current user's profiles", async() => {
        const userId = "someone";

        const profile = profileDocument(userId);

        await firebase.assertSucceeds(profile.get());
    });

    it("allows writing to the current user's profiles", async() => {
        const userId = "someone";

        const profile = profileDocument(userId);

        await firebase.assertSucceeds(profile.set(validProfileData()));
    });

    it("does not allow creating a profile without an url", async() => {
        const userId = "someone";
        const profileData: any = validProfileData();
        delete profileData.url;

        const profile = profileDocument(userId);

        await firebase.assertFails(profile.set(profileData));
    });

    it("does not allow creating a profile with an empty url", async() => {
        const userId = "someone";
        const profileData = validProfileData();
        profileData.url = "";

        const profile = profileDocument(userId);

        await firebase.assertFails(profile.set(profileData));
    });
});