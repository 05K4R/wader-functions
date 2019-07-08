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

exports.updateRepost = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const repostInfo = data.repostInfo;

    return updateRepost(uid, repostInfo);
});

async function updateProfile(uid, profileInfo) {
    if (typeof profileInfo.url !== 'string') {
        return Promise.reject(new Error('profile url must be a string'));
    }

    const profileId = getProfileId(profileInfo);

    let profile = await fetchProfile(uid, profileId);
    if (profile === undefined) {
        profile = createProfile(profileInfo);
    }

    if (typeof profileInfo.name === 'string') {
        profile.name = profileInfo.name;
    }

    const options = {
        merge: true
    }

    return profileCollection(uid).doc(profileId).set(profile, options);
}

async function updateTrack(uid, trackInfo) {
    if (typeof trackInfo.url !== 'string') {
        return Promise.reject(new Error('track url must be a string'));
    }

    await updateProfile(uid, trackInfo.uploaderInfo);

    const trackId = getTrackId(trackInfo)

    let track = await fetchTrack(uid, trackId);
    if (track === undefined) {
        track = createTrack(trackInfo)
    }

    if (typeof trackInfo.name === 'string') {
        track.name = trackInfo.name;
    }

    const options = {
        merge: true
    }

    return trackCollection(uid).doc(trackId).set(track, options);
}

async function updateRepost(uid, repostInfo) {
    if (typeof repostInfo.time !== 'number') {
        return Promise.reject(new Error('repost time must be a number'));
    }

    await updateProfile(uid, repostInfo.reposterInfo);
    await updateTrack(uid, repostInfo.trackInfo);

    const repostId = getRepostId(repostInfo)

    let repost = await fetchRepost(uid, repostId);
    if (repost === undefined) {
        repost = createRepost(repostInfo);
    }

    return repostCollection(uid).doc(repostId).set(repost);
}

function getProfileId(profileInfo) {
    return profileInfo.url;
}

function getTrackId(trackInfo) {
    return trackInfo.uploaderInfo.url + ';' + trackInfo.url;
}

function getRepostId(repostInfo) {
    const reposterId = getProfileId(repostInfo.reposterInfo);
    const trackId = getTrackId(repostInfo.trackInfo);

    return reposterId + ';' + repostInfo.time + ';' + trackId;
}

function createProfile(profileInfo) {
    return {
        url: profileInfo.url
    };
}

function createTrack(trackInfo) {
    return {
        url: trackInfo.url,
        uploader: getProfileId(trackInfo.uploaderInfo)
    };
}

function createRepost(repostInfo) {
    return {
        time: repostInfo.time,
        track: getTrackId(repostInfo.trackInfo),
        reposter: getProfileId(repostInfo.reposterInfo)
    };
}

async function fetchProfile(uid, profileId) {
    const profileDocument = await (profileCollection(uid).doc(profileId).get());
    return profileDocument.data();
}

async function fetchTrack(uid, trackId) {
    const trackDocument = await (trackCollection(uid).doc(trackId).get());
    return trackDocument.data();
}

async function fetchRepost(uid, repostId) {
    const repostDocument = await (repostCollection(uid).doc(repostId).get());
    return repostDocument.data();
}

function profileCollection(uid) {
    return userCollection().doc(uid).collection('profiles');
}

function trackCollection(uid) {
    return userCollection().doc(uid).collection('tracks');
}

function repostCollection(uid) {
    return userCollection().doc(uid).collection('reposts');
}

function userCollection() {
    return admin.firestore().collection('users');
}
