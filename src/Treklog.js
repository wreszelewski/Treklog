const app = require('./lib/app');
const createTrackList = require('./lib/trackList').createTrackList;
const database = require('./lib/database');
const loader = require('./lib/loader');

const Treklog = {
    setUp: app,
    trackList: {
        renderUserTrackList,
        renderAdminTrackList
    },
    loadTrack: require('./lib/trackLoader').loadTrack,
    auth: require('./lib/auth'),
    uploader: require('./lib/trackUploader'),
    editor: require('./lib/trackEditor'),
    animation: require('./lib/animation')
}

function renderUserTrackList() {
    renderTrackList('user');
}

function renderAdminTrackList() {
    renderTrackList('admin');
}

function renderTrackList(mode) {
    database.getTracks().then(function(tracks) {
        let trackList = document.getElementById('trackList');
        const trackObjects = createTrackList(tracks, mode);
        trackObjects.forEach(track => trackList.appendChild(track));
    }).then(() => {
        if (window.location.pathname === "/" || window.location.pathname === '/admin') {
            loader.hideLoader();
            $('#trackMenu').modal('show');
        }
    });
}



window.Treklog = Treklog;