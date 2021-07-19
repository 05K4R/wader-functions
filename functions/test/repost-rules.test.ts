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

function validRepostData() {
    return {
        reposter: "reposter",
        time: 1,
        track: "track"
    }
}

function repostDocument(userId: string) {
    const database = ruleTestUtils.authedFirestore(userId);
    return repostDocumentForDatabase(userId, database);
}

function repostDocumentForDatabase(userId: string, database: firebase.firestore.Firestore) {
    const userDoc = database.collection("users").doc(userId);
    return userDoc.collection("reposts").doc("repost");
}

describe("Wader repost security rules", () => {
    it("does not allow reading from other user's reposts", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersRepost = repostDocumentForDatabase(otherUserId, db);
        
        await firebase.assertFails(otherUsersRepost.get());
    });

    it("does not allow writing to other user's reposts", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersRepost = repostDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersRepost.set(validRepostData()));
    });

    it("allows reading from the current user's reposts", async() => {
        const userId = "someone";

        const repost = repostDocument(userId);

        await firebase.assertSucceeds(repost.get());
    });

    it("allows writing to the current user's reposts", async() => {
        const userId = "someone";

        const repost = repostDocument(userId);

        await firebase.assertSucceeds(repost.set(validRepostData()));
    });

    it("does not allow creating a repost without a reposter", async() => {
        const userId = "someone";
        const repostData: any = validRepostData();
        delete repostData.reposter;

        const repost = repostDocument(userId);

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a repost with an empty reposter", async() => {
        const userId = "someone";
        const repostData = validRepostData();
        repostData.reposter = "";

        const repost = repostDocument(userId);

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a repost without a track", async() => {
        const userId = "someone";
        const repostData: any = validRepostData();
        delete repostData.track;

        const repost = repostDocument(userId);

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a repost with an empty track", async() => {
        const userId = "someone";
        const repostData = validRepostData();
        repostData.track = "";

        const repost = repostDocument(userId);

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a repost without a time", async() => {
        const userId = "someone";
        const repostData: any = validRepostData();
        delete repostData.time

        const repost = repostDocument(userId);

        await firebase.assertFails(repost.set(repostData));
    });
});