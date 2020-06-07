[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5d11bf3b215a4e2f80e5ff590fea9c84)](https://www.codacy.com/manual/karrman.oskar/wader-functions?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=05K4R/wader-functions&amp;utm_campaign=Badge_Grade)
# Wader Functions
Firebase Cloud Functions for the [Wader Chrome extension](https://github.com/05K4R/wader-chrome-extension/).

Preview version available at the  [Chrome Web Store](https://chrome.google.com/webstore/detail/wader/gjjdinpmbhdnnhoegfdaamjcmjaekcok).

## Set up
1. Follow step 1 in the [Firebase Cloud Functions get started guide](https://firebase.google.com/docs/functions/get-started).
2. Type 'firebase login' into your console, and login to Firebase.
3. Deploy your things with 'firebase deploy'!

## Run Functions locally
1. Install Firebase Tools
```
npm install -g firebase-tools
```
2. Start emulator
```
firebase emulators:start
```

## Run tests in emulator
```
firebase emulators:exec --only firestore 'npm test'
```
