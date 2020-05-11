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
    it("can read own data", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someone");
        const document = profile.collection("development").doc("doc");
        await document.set({ test: "test" });

        await firebase.assertSucceeds(document.get());
    });

    it("can't read other profiles data", async() => {
        const db1 = authedApp({ uid: "someone" });
        const profile1 = db1.collection("users").doc("someone");
        const document1 = profile1.collection("development").doc("doc");
        await document1.set({ test: "test" });

        const db2 = authedApp({ uid: "someoneelse" });
        const profile2 = db2.collection("users").doc("someone");
        const document2 = profile2.collection("development").doc("doc");

        await firebase.assertFails(document2.get());
    });

    it("can't write to arbitrary collection", async() => {
        const db = authedApp({ uid: "someone" });
        const profile = db.collection("users").doc("someone");
        const document = profile.collection("hello").doc("yoo");

        await firebase.assertFails(document.set({ test: "nice" }));
    });
});
