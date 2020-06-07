const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const Categories = {
    GREAT: 30,
    GOOD: 20,
    OKAY: -1,
    BAD: -20
};

const MINIMUM_TRACKS_FOR_SCORE = 20;

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

exports.getProfileScore = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const profileInfo = data.profileInfo;

    return getProfileScore(uid, profileInfo);
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

async function getProfileScore(uid, profileInfo) {
    const profileId = getProfileId(profileInfo);
    const uploadedTracks = await fetchTracksUploadedByProfile(uid, profileId);
    const repostedTracks = await fetchTracksRepostedByProfile(uid, profileId);
    const playlistTracks = await fetchTracksInPlaylistsPostedByProfile(uid, profileId);
    const repostedPlaylistTracks = await fetchTracksInPlaylistsRepostedByProfile(uid, profileId);

    const allTracks = [
        ...uploadedTracks,
        ...repostedTracks,
        ...playlistTracks,
        ...repostedPlaylistTracks
    ];
    const categorizedTracks = allTracks.filter(track => Categories[track.category] !== undefined);

    if (categorizedTracks.length < MINIMUM_TRACKS_FOR_SCORE) {
        return 0;
    } else {
        let score = 0;
        categorizedTracks.forEach(track => {
            score += getTrackScore(track);
        });
        return score;
    }
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
    return category.toUpperCase();
}

function getTrackScore(track) {
    return Categories[track.category];
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
        && Categories.hasOwnProperty(category.toUpperCase())
}

async function fetchTracksUploadedByProfile(uid, profileId) {
    return fetchMultipleEquals(trackCollection(uid), 'uploader', profileId);
}

async function fetchTracksRepostedByProfile(uid, profileId) {
    const reposts = await fetchMultipleEquals(repostCollection(uid), 'reposter', profileId);
    const fetchPromises = [];
    reposts.forEach(repost => {
        fetchPromises.push(fetchTrack(uid, repost.track));
    })
    return Promise.all(fetchPromises);
}

async function fetchTracksInPlaylistsPostedByProfile(uid, profileId) {
    const playlists = await fetchMultipleEquals(playlistCollection(uid), 'poster', profileId);
    const fetchPromises = [];
    playlists.forEach(playlist => {
        playlist.tracks.forEach(track => {
            fetchPromises.push(fetchTrack(uid, track));
        });
    });
    return Promise.all(fetchPromises);
}

async function fetchTracksInPlaylistsRepostedByProfile(uid, profileId) {
    const playlistReposts = await fetchMultipleEquals(playlistRepostCollection(uid), 'reposter', profileId);
    const playlistFetchPromises = [];
    playlistReposts.forEach(repost => {
        playlistFetchPromises.push(fetchPlaylist(uid, repost.playlist))
    });

    const playlists = await Promise.all(playlistFetchPromises)
    const trackFetchPromises = [];
    playlists.forEach(playlist => {
        playlist.tracks.forEach(track => {
            trackFetchPromises.push(fetchTrack(uid, track));
        });
    });
    return Promise.all(trackFetchPromises);
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

async function fetchPlaylist(uid, playlistId) {
    return fetchData(playlistCollection(uid), playlistId);
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

function playlistCollection(uid) {
    return userCollection().doc(uid).collection('playlists');
}

function playlistRepostCollection(uid) {
    return userCollection().doc(uid).collection('playlistReposts');
}

function userCollection() {
    return admin.firestore().collection('users');
}

async function fetchData(collection, id) {
    const document = await (collection.doc(id).get());
    return document.data();
}

async function fetchMultipleEquals(collection, attribute, id) {
    const snapshot = await collection.where(attribute, '==', id).get();
    return snapshot.docs.map(doc => doc.data());
}

async function saveDocumentWithMerge(collection, id, document) {
    const options = {
        merge: true
    }

    return collection.doc(id).set(document, options);
}
