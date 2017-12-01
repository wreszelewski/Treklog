const moment = require('moment');
const { getTracksRaw, storeFile, storeTrackMetadata, updateTrack, storeSocialImageAndMeta } = require('./utils/firebase');

function getTracks() {
    let tracksObj = localStorage.getItem('tracks');
    if(tracksObj) {
        tracksObj = JSON.parse(tracksObj);
    }
    
    const hourBefore = moment();
    hourBefore.subtract(1, 'hours');
    if(tracksObj && moment(tracksObj.refreshDate).isAfter(hourBefore)) {
        return Promise.resolve(tracksObj.tracks);
    } else {
        return getTracksRaw().then((tracksInYearRaw) => {
            newTracksObj = {
                refreshDate: moment().toISOString(),
                tracks: tracksInYearRaw
            }
            localStorage.setItem('tracks', JSON.stringify(newTracksObj));
            return newTracksObj.tracks;
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