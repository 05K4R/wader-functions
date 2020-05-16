const firebase = require("@firebase/testing");
const fs = require("fs");

const projectId = "wader-playlist-repost-testing";
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

function validRepostData() {
    return {
        reposter: "reposter",
        time: 123456,
        playlist: "playlist"
    };
}

describe("Wader playlist repost security rules", () => {
    it("does not allow reading from other user's playlist reposts", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedApp({ uid: userId });
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersRepost = otherUser.collection("playlistReposts").doc("repost");

        await firebase.assertFails(otherUsersRepost.get());
    });

    it("does not allow writing to other user's playlist reposts", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedApp({ uid: userId });
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersReposts = otherUser.collection("playlistReposts").doc("repost");

        await firebase.assertFails(otherUsersReposts.set(validRepostData()));
    });

    it("allows reading from the current user's playlist reposts", async() => {
        const userId = "someone";

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertSucceeds(repost.get());
    });

    it("allows writing to the current user's playlist reposts", async() => {
        const userId = "someone";

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertSucceeds(repost.set(validRepostData()));
    });

    it("does not allow creating a playlist repost without a reposter", async() => {
        const repostData = validRepostData();
        delete repostData.reposter;

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a playlist repost with an empty reposter", async() => {
        const repostData = validRepostData();
        repostData.reposter = "";

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a playlist repost without a playlist", async() => {
        const repostData = validRepostData();
        delete repostData.playlist;

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a playlist repost with an empty playlist", async() => {
        const repostData = validRepostData();
        repostData.playlist = "";

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertFails(repost.set(repostData));
    });

    it("does not allow creating a playlist repost without a time", async() => {
        const repostData = validRepostData();
        delete repostData.time;

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const repost = user.collection("playlistReposts").doc("repost");

        await firebase.assertFails(repost.set(repostData));
    });
});
