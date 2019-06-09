const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.updateProfile = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const profileId = data.profileId;
    const profileInfo = data.profileInfo;

    return updateProfile(uid, profileId, profileInfo);
});

exports.getGroupRatios = functions.https.onCall((data, context) => {
    const uid = context.auth.uid;
    const profileId = data.profileId;

    const categoryTotals = {};
    const labelTotals = {};

    return getAllRepostedAndUploadedTracks(profileId, uid).then(tracks => {
        for (const track of tracks) {
            const category = track.category;
            if (!category) {
                continue;
            }

            if (categoryTotals[category.name] === undefined) {
                categoryTotals[category.name] = 0;
            }
            categoryTotals[category.name] += 1;
        }

        for (const track of tracks) {
            const labels = track.labels;
            for (const label of labels) {
                if (labelTotals[label.name] === undefined) {
                    labelTotals[label.name] = 0;
                }
                labelTotals[label.name] += 1;
            }
        }

        return {
            labels: labelTotals,
            categories: categoryTotals
        }
    });
});

async function updateProfile(uid, profileId, profileInfo) {
    const profile = await getProfile(uid, profileId);

    if (typeof profileInfo.url === 'string') {
        profile.url = profileInfo.url;
    }

    if (typeof profileInfo.name === 'string') {
        profile.name = profileInfo.name;
    }

    const options = {
        merge: true
    }

    return getUserCollection().doc(uid).collection('profiles').doc(profileId).set(profile, options);
}

async function getProfile(uid, profileId) {
    if (typeof profileId !== 'string') {
        return Promise.reject(new Error('profile ID must be a string'));
    }

    const profileDocument = await (getUserCollection().doc(uid).collection('profiles').doc(profileId).get());
    let profile = profileDocument.data();

    if (profile === undefined) {
        profile = {
            id: profileId
        }
    }

    return profile;
}

function getCategory(track, uid) {
    return getUserCollection().doc(uid).collection('tracks').doc(track.id).get().then(document => {
        const realTrack = document.data();
        return realTrack.category;
    });
}

function getAllRepostedAndUploadedTracks(profileId, uid) {
    const allTracks = [];
    return getUserCollection().doc(uid).collection('reposts').where('reposter.id', '==', profileId).get().then(documents => {
        documents.forEach(doc => {
            const repost = doc.data();
            allTracks.push(repost.track);
        });
        return getUserCollection().doc(uid).collection('tracks').where('uploader.id', '==', profileId).get();
    }).then(documents => {
        documents.forEach(doc => {
            allTracks.push(doc.data());
        });
        return allTracks;
    });
}

function getUserCollection() {
    return admin.firestore().collection('users');
}
