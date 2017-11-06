const firebase = require('firebase');
const moment = require('moment');

function getTracks(forceRefresh=false) {
    let tracksObj = localStorage.getItem('tracks');
    if(tracksObj) {
        tracksObj = JSON.parse(tracksObj);
    }
    if(!forceRefresh && tracksObj && moment(tracksObj.refreshDate).isAfter(moment().subtract('1 hour'))) {
        return Promise.resolve(tracksObj.tracks);
    } else {
        return firebase.database().ref('/tracks').once('value').then(function (tracksInYearRaw) {
            newTracksObj = {
                refreshDate: moment().toISOString,
                tracks: tracksInYearRaw.val()
            }
            localStorage.setItem('tracks', JSON.stringify(newTracksObj));
            return newTracksObj.tracks;
        });
    }
}

function getTrack(path, forceRefresh=false) {
    if(path.startsWith('/')) {
        path = path.slice(1);
    }
    const splittedPath = path.split('/');
    console.log(splittedPath);
    return getTracks(forceRefresh)
        .then(currentTrack => {
            console.log(currentTrack);
            splittedPath.forEach(pathElement => {
                currentTrack = currentTrack[pathElement];
            });
            return currentTrack
        });
}

function storeTrack(data, filteredTrack, originalTrack) {
    const metadata = {
        contentType: 'aplication/json',
    };
    const lightFileUpload = firebase.storage().ref().child(data.geoJsonPath).putString(JSON.stringify(filteredTrack, 'raw', metadata));
    const originalFileUplaod = firebase.storage().ref().child(data.originalGeoJsonPath).putString(JSON.stringify(originalTrack), 'raw', metadata);
    return Promise.all([lightFileUpload, originalFileUplaod])
        .then(() => {
            return firebase.database().ref('tracks' + data.url).set(data);
        });
}

module.exports = {
    getTracks,
    getTrack,
    storeTrack
}