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

        await firebase.assertFails(otherUsersPlaylist.set({ url: "test", poster: "test", tracks: [] }));
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

        await firebase.assertSucceeds(playlist.set({ url: "test", poster: "test", tracks: [] }));
    });

    it("does not allow creating a playlist without an url", async() => {
        const userId = "someone";
        const playlistData = { poster: "poster", tracks: [] };

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });

    it("does not allow creating a playlist with an empty url", async() => {
        const userId = "someone";
        const playlistData = { poster: "poster", url: "", tracks: [] };

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });

    it("does not allow creating a playlist without a poster", async() => {
        const userId = "someone";
        const playlistData = { url: "url", tracks: [] };

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });

    it("does not allow creating a playlist with an empty poster", async() => {
        const userId = "someone";
        const playlistData = { poster: "", url: "url", tracks: [] };

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });

    it("allows creating a playlist with a poster and an url", async() => {
        const userId = "someone";
        const playlistData = { poster: "poster", url: "url", tracks: [] };

        const db = authedApp({ uid: userId });
        const user = db.collection("users").doc(userId);
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.set(playlistData));
    });

    it("does not allow creating a playlist without a list for tracks", async() => {
        const playlistData = { poster: "poster", url: "url" };

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });

    it("allows creating a playlist with no track IDs", async() => {
        const trackIds = [];
        const playlistData = { poster: "poster", url: "url", tracks: trackIds};

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.set(playlistData));
    });

    it("allows creating a playlist with one track ID", async() => {
        const trackIds = ['track'];
        const playlistData = { poster: "poster", url: "url", tracks: trackIds};

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.set(playlistData));
    });

    it("allows creating a playlist with multiple track IDs", async() => {
        const trackIds = ['track1', 'track2'];
        const playlistData = { poster: "poster", url: "url", tracks: trackIds};

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertSucceeds(playlist.set(playlistData));
    });

    it("does not allow creating a playlist with a string as track", async() => {
        const tracks = 'track';
        const playlistData = { poster: "poster", url: "url", tracks: tracks};

        const db = authedApp({ uid: "someone" });
        const user = db.collection("users").doc("someone");
        const playlist = user.collection("playlists").doc("list");

        await firebase.assertFails(playlist.set(playlistData));
    });
});
