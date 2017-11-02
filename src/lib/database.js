const firebase = require('firebase');
const moment = require('moment');

function getTracks() {
    let tracksObj = localStorage.getItem('tracks');
    if(tracksObj) {
        tracksObj = JSON.parse(tracksObj);
    }
    if(tracksObj && moment(tracksObj.refreshDate).isAfter(moment().subtract('1 hour'))) {
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

module.exports = {
    getTracks,
    getTrack
}