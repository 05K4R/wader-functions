const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.updateProfile = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const profileInfo = data.profileInfo;

    return updateProfile(uid, profileInfo);
});

exports.updateTrack = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const trackInfo = data.trackInfo;

    return updateTrack(uid, trackInfo);
});

async function updateProfile(uid, profileInfo) {
    if (typeof profileInfo.url !== 'string') {
        return Promise.reject(new Error('profile url must be a string'));
    }

    const profileId = profileInfo.url;

    let profile = await getProfile(uid, profileId);
    if (profile === undefined) {
        profile = {
            url: profileInfo.url
        }
    }

    if (typeof profileInfo.name === 'string') {
        profile.name = profileInfo.name;
    }

    const options = {
        merge: true
    }

    return getUserCollection().doc(uid).collection('profiles').doc(profileId).set(profile, options);
}

async function updateTrack(uid, trackInfo) {
    if (typeof trackInfo.url !== 'string') {
        return Promise.reject(new Error('track url must be a string'));
    }

    await updateProfile(uid, trackInfo.uploaderInfo);
    const trackId = trackInfo.uploaderInfo.url + ';' + trackInfo.url;

    let track = await getTrack(uid, trackId);
    if (track === undefined) {
        track = {
            url: trackInfo.url,
            uploader: trackInfo.uploaderInfo.url
        }
    }

    if (typeof trackInfo.name === 'string') {
        track.name = trackInfo.name;
    }

    const options = {
        merge: true
    }

    return getUserCollection().doc(uid).collection('tracks').doc(trackId).set(track, options);
}

async function getProfile(uid, profileId) {
    const profileDocument = await (getUserCollection().doc(uid).collection('profiles').doc(profileId).get());
    return profileDocument.data();
}

async function getTrack(uid, trackId) {
    const trackDocument = await(getUserCollection().doc(uid).collection('tracks').doc(trackId).get());
    return trackDocument.data();
}

function getUserCollection() {
    return admin.firestore().collection('users');
}
