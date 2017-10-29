const app = require('./lib/app');

var Treklog = {
    setUp: app,
    trackList: require('./lib/trackList.js'),
    loadTrack: require('./lib/trackLoader').loadTrack,
    auth: require('./lib/auth'),
    uploader: require('./lib/trackUploader')
}

window.Treklog = Treklog;