const firebase = require("@firebase/testing");
const fs = require("fs");

const projectId = "wader-testing";
const rules = fs.readFileSync("../firestore.rules", "utf8");

function authedApp(auth) {
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

describe("Wader Firestore backend", () => {
    it("can't create a track without an URL", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someone");
        const track = profile.collection("tracks").doc("123;123")
        await firebase.assertFails(track.set({ uploader: "uploader" }));
    });

    it("can't create a track without an uploader ID", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someone");
        const track = profile.collection("tracks").doc("123;123")
        await firebase.assertFails(track.set({ url: "trackurl" }));
    });

    it("can create a track with only uploader ID and URL", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someone");
        const track = profile.collection("tracks").doc("123;123")
        await firebase.assertSucceeds(track.set({ url: "trackurl", uploader: "uploader"}));
    });

    it("can only create a track in their own user data", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someoneelse");
        const track = profile.collection("tracks").doc("123;123")
        await firebase.assertFails(track.set({ url: "trackurl", uploader: "uploader"}));
    });
});
