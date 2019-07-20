const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const validCategories = {
    GREAT: 'great',
    GOOD: 'good',
    OKAY: 'okay',
    BAD: 'bad'
};

exports.updateProfile = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const profileInfo = data.profileInfo;

    if (isValidProfileInfo(profileInfo)) {
        return updateProfile(uid, profileInfo);
    } else {
        return Promise.reject(new Error('invalid profileInfo'));
    }
});

exports.updateTrack = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const trackInfo = data.trackInfo;

    if (isValidTrackInfo(trackInfo)) {
        return updateTrack(uid, trackInfo);
    } else {
        return Promise.reject(new Error('invalid trackInfo'));
    }
});

exports.updateRepost = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const repostInfo = data.repostInfo;

    if (isValidRepostInfo(repostInfo)) {
        return updateRepost(uid, repostInfo);
    } else {
        return Promise.reject(new Error('invalid repostInfo'));
    }
});

exports.setCategoryOnTrack = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const category = data.category;
    const trackInfo = data.trackInfo;

    if (!isValidCategory(category)) {
        return Promise.reject(new Error('invalid category'));
    } else if (!isValidTrackInfo(trackInfo)) {
        return Promise.reject(new Error('invalid trackInfo'));
    } else {
        return setCategoryOnTrack(uid, category, trackInfo);
    }
});

async function updateProfile(uid, profileInfo) {
    const profileId = getProfileId(profileInfo);

    let profile = await fetchProfile(uid, profileId);
    if (profile === undefined) {
        profile = createProfile(profileInfo);
    }

    if (typeof profileInfo.name === 'string') {
        profile.name = profileInfo.name;
    }

    return saveProfile(uid, profileId, profile);
}

async function updateTrack(uid, trackInfo) {
    await updateProfile(uid, trackInfo.uploaderInfo);

    const trackId = getTrackId(trackInfo)

    let track = await fetchTrack(uid, trackId);
    if (track === undefined) {
        track = createTrack(trackInfo)
    }

    if (typeof trackInfo.name === 'string') {
        track.name = trackInfo.name;
    }

    return saveTrack(uid, trackId, track);
}

async function updateRepost(uid, repostInfo) {
    await updateProfile(uid, repostInfo.reposterInfo);
    await updateTrack(uid, repostInfo.trackInfo);

    const repostId = getRepostId(repostInfo);

    let repost = await fetchRepost(uid, repostId);
    if (repost === undefined) {
        repost = createRepost(repostInfo);
    }

    return saveRepost(uid, repostId, repost);
}

async function setCategoryOnTrack(uid, category, trackInfo) {
    await updateTrack(uid, trackInfo);

    const trackId = getTrackId(trackInfo);
    const categoryId = getCategoryId(category);

    const track = await fetchTrack(uid, trackId);
    track.category = categoryId;

    return saveTrack(uid, trackId, track);
}

function getProfileId(profileInfo) {
    return profileInfo.url;
}

function getTrackId(trackInfo) {
    const uploaderId = getProfileId(trackInfo.uploaderInfo);
    return uploaderId + ';' + trackInfo.url;
}

function getRepostId(repostInfo) {
    const reposterId = getProfileId(repostInfo.reposterInfo);
    const trackId = getTrackId(repostInfo.trackInfo);
    return reposterId + ';' + repostInfo.time + ';' + trackId;
}

function getCategoryId(category) {
    return validCategories[category.toUpperCase()];
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

function isValidProfileInfo(profileInfo) {
    return typeof profileInfo.url === 'string';
}

function isValidTrackInfo(trackInfo) {
    return typeof trackInfo.url === 'string'
        && isValidProfileInfo(trackInfo.uploaderInfo);
}

function isValidRepostInfo(repostInfo) {
    return typeof repostInfo.time === 'number'
        && isValidProfileInfo(repostInfo.reposterInfo)
        && isValidTrackInfo(repostInfo.trackInfo);
}

function isValidCategory(category) {
    return typeof category === 'string'
        && validCategories.hasOwnProperty(category.toUpperCase())
}

async function fetchProfile(uid, profileId) {
    return fetchData(profileCollection(uid), profileId);
}

async function fetchTrack(uid, trackId) {
    return fetchData(trackCollection(uid), trackId);
}

async function fetchRepost(uid, repostId) {
    return fetchData(repostCollection(uid), repostId);
}

async function saveProfile(uid, profileId, profile) {
    return saveDocumentWithMerge(profileCollection(uid), profileId, profile);
}

async function saveTrack(uid, trackId, track) {
    return saveDocumentWithMerge(trackCollection(uid), trackId, track);
}

async function saveRepost(uid, repostId, repost) {
    return saveDocumentWithMerge(repostCollection(uid), repostId, repost);
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

async function fetchData(collection, id) {
    const document = await (collection.doc(id).get());
    return document.data();
}

async function saveDocumentWithMerge(collection, id, document) {
    const options = {
        merge: true
    }

    return collection.doc(id).set(document, options);
}
