const moment = require('moment');
const { getTracksRaw, storeFile, storeTrackMetadata } = require('./utils/firebase');

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
                refreshDate: moment().toISOString,
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
                currentTrack = currentTrack[pathElement];
            });
            return currentTrack
        });
}

function storeTrack(data, filteredTrack, originalTrack) {
    const metadata = {
        contentType: 'application/json',
    };
    const lightFileUpload = storeFile(data.geoJsonPath, filteredTrack, metadata);
    const originalFileUplaod = storeFile(data.originalGeoJsonPath, originalTrack, metadata);
    return Promise.all([lightFileUpload, originalFileUplaod])
        .then(() => {
            return storeTrackMetadata(data.url, data);
        });
}

module.exports = {
    getTracks,
    getTrack,
    storeTrack
}