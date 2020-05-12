const firebase = require("@firebase/testing");
const fs = require("fs");

const projectId = "wader-playlist-testing";
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

describe("Wader playlist security rules", () => {
    it("does not allow reading from other user's playlists", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedApp({ uid: userId });
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersPlaylist = otherUser.collection("playlists").doc("list");

        await firebase.assertFails(otherUsersPlaylist.get());
    });

    it("does not allow writing to other user's playlists", async() => {
        const userId = "someone";
        const otherUserId = "someoneelse";

        const db = authedApp({ uid: userId });
        const otherUser = db.collection("users").doc(otherUserId);
        const otherUsersPlaylist = otherUser.collection("playlists").doc("list");

        await firebase.assertFails(otherUsersPlaylist.set({ url: "test", profile: "test" }));
    });

    it("allows reading from the current user's playlists", async() => {
        const userId = "someone";

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.get());
    });

    it("allows writing to the current user's playlists", async() => {
        const userId = "someone";

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.set({ url: "test", profile: "test" }));
    });
});
