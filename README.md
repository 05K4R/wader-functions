# Wader Functions
Firebase Cloud Functions for the [Wader Chrome extension](https://github.com/05K4R/wader-chrome-extension/).

## Set up
1. Follow step 1 in the [Firebase Cloud Functions get started guide](https://firebase.google.com/docs/functions/get-started).
2. Install the Firebase emulator suite by following [this guide](https://firebase.google.com/docs/emulator-suite/install_and_configure).
3. Type 'firebase login' into your console, and login to Firebase.
4. Deploy your things with 'firebase deploy'!

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
While in the functions directory:
```
firebase emulators:exec --only firestore 'npm test'
```
