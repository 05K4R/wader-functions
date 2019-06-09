const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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
