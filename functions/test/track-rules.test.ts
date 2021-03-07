import * as firebase from '@firebase/testing';
import { readFileSync } from 'fs';

const projectId = "wader-track-testing";
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

function validTrackData() {
    return {
        url: "url",
        name: "Artist - Name",
        uploader: "uploader",
        category: "OKAY"
    }
}

function trackDocumentForDatabase(userId: string, database: firebase.firestore.Firestore) {
    const userDoc = database.collection("users").doc(userId);
    return userDoc.collection("tracks").doc("track");
}

function trackDocument(userId: string) {
    const database = authedFirestore(userId);
    return trackDocumentForDatabase(userId, database);
}

describe("Wader track security rules", () => {
    it("does not allow reading from other user's tracks", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedFirestore(userId);
        const otherUsersTrack = trackDocumentForDatabase(otherUserId, db);

        await firebase.assertFails(otherUsersTrack.get());
    });

    it("does not allow writing to other user's tracks", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedFirestore(userId);
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