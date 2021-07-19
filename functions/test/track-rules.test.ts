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

function validTrackData() {
    return {
        url: "url",
        name: "Artist - Name",
        uploader: "uploader",
        category: "OKAY"
    }
}

function trackDocument(userId: string) {
    const database = ruleTestUtils.authedFirestore(userId);
    return trackDocumentForDatabase(userId, database);
}

function trackDocumentForDatabase(userId: string, database: firebase.firestore.Firestore) {
    const userDoc = database.collection("users").doc(userId);
    return userDoc.collection("tracks").doc("track");
}

describe("Wader track security rules", () => {
    it("does not allow reading from other user's tracks", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersTrack = trackDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersTrack.get());
    });

    it("does not allow writing to other user's tracks", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = ruleTestUtils.authedFirestore(userId);
        const otherUsersTrack = trackDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersTrack.set(validTrackData()));
    });

    it("allows reading from the current user's tracks", async() => {
        const userId = "someone";

        const track = trackDocument(userId);

        await firebase.assertSucceeds(track.get());
    });

    it("allows writing to the current user's tracks", async() => {
        const userId = "somenoe";

        const track = trackDocument(userId);

        await firebase.assertSucceeds(track.set(validTrackData()));
    });

    it("does not allow creating a track without an url", async() => {
        const userId = "someone";
        const trackData: any = validTrackData();
        delete trackData.url;

        const track = trackDocument(userId);

        await firebase.assertFails(track.set(trackData));
    });

    it("does not allow creating a track with an empty url", async() => {
        const userId = "someone"
        const trackData = validTrackData();
        trackData.url = "";

        const track = trackDocument(userId);

        await firebase.assertFails(track.set(trackData));
    });

    it("does not allow creating a track without an uploader", async() => {
        const userId = "someone";
        const trackData: any = validTrackData();
        delete trackData.uploader;

        const track = trackDocument(userId);

        await firebase.assertFails(track.set(trackData));
    });

    it("does not allow creating a track with an empty uploader", async() => {
        const userId = "someone";
        const trackData = validTrackData();
        trackData.uploader = "";

        const track = trackDocument(userId);

        await firebase.assertFails(track.set(trackData));
    });
});