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
});
