const moment = require('moment');
const { getTracksRaw, storeFile, storeTrackMetadata, updateTrack, storeSocialImageAndMeta } = require('./utils/firebase');
let tracksObj = null;


function getTracks() {

    if(tracksObj) {
        return Promise.resolve(tracksObj);
    } else {
        return getTracksRaw().then((tracksInYearRaw) => {
            tracksObj = tracksInYearRaw;
            return tracksObj;
        });
    }
}

function getTrack(path) {
    if(path.startsWith('/')) {
        path = path.slice(1);
    }
    const splittedPath = path.split('/');
    return getTracks()
        .then(currentTrack => {
            splittedPath.forEach(pathElement => {
                if(pathElement === 'admin') {
                    return;
                } 
                currentTrack = currentTrack[pathElement];
            });
            return currentTrack
        });
}

function storeTrack(data, filteredTrack, originalTrack) {
    const metadata = {
        contentType: 'application/json',
    };
    return storeFile(data.geoJsonPath, filteredTrack, metadata)
        .then(() => {
            return storeFile(data.originalGeoJsonPath, originalTrack, metadata);
        }).then(() => {
            return storeTrackMetadata(data.url, data);
        });
}

function setTrackInitialPosition(path, initialPosition) {
    path = path.replace('/admin', '');
    return updateTrack(path, 'initialPosition', initialPosition);
}

function storeSocialImage(path, data) {
    path = path.replace('/admin', '');
    return storeSocialImageAndMeta(path, data);
}

module.exports = {
    getTracks,
    getTrack,
    storeTrack,
    setTrackInitialPosition,
    storeSocialImage
}