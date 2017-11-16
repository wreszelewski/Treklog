const firebase = require('firebase');

function getTracksRaw() {
    return firebase.database().ref('/tracks').once('value')
        .then(tracksInYearRaw => tracksInYearRaw.val());
}

function storeFile(path, content, metadata) {
    return firebase.storage().ref().child(path).putString(JSON.stringify(content), 'raw', metadata);
}

function storeFileRaw(path, content, metadata) {
    return firebase.storage().ref().child(path).putString(content, 'raw', metadata);
}

function storeTrackMetadata(path, data) {
    return firebase.database().ref('tracks' + path).set(data);
}

function storeSocialImageAndMeta(path, data) {
    const imgPath = '/socialImages' + path + '.jpg';
    const metadata = {
        contentType: 'image/jpeg',
    };      
    firebase.storage().ref().child(imgPath).putString(data, 'data_url', metadata).then((image) => {
        let updates = {};
        updates['socialImage'] = image.downloadURL;
        console.log(image.downloadURL);
        console.log(image);
        return firebase.database().ref('tracks' + path).update(updates);
    });
}

function updateTrack(path, field, data) {
    let updates = {}
    updates[field] = data;
    return firebase.database().ref('tracks' + path).update(updates);
}

module.exports = {
    getTracksRaw,
    storeFile,
    storeFileRaw,
    storeTrackMetadata,
    updateTrack,
    storeSocialImageAndMeta
}