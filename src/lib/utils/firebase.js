const firebase = require('firebase');

function getTracksRaw() {
    return firebase.database().ref('/tracks').once('value')
        .then(tracksInYearRaw => tracksInYearRaw.val());
}

function storeFile(path, content, metadata) {
    return firebase.storage().ref().child(path).putString(JSON.stringify(content, 'raw', metadata));
}

function storeTrackMetadata(path, data) {
    return firebase.database().ref('tracks' + path).set(data);
}

module.exports = {
    getTracksRaw
}