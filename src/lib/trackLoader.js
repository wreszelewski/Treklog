const firebase = require('firebase');
const database = require('./database');
const loader = require('./loader');

function loadTrackByPath(path, maxFlightHeight) {
    database.getTrack(path).then(function (track) {
        loadTrack(track, maxFlightHeight);
    });
}

function loadTrack(track, maxFlightHeight) {
    const storage = firebase.storage();
    storage.ref(track.geoJsonPath)
        .getDownloadURL()
        .then((url) => {
            viewer.dataSources.removeAll();

            return Cesium.GeoJsonDataSource.load(url, {
                stroke: Cesium.Color.RED,
                fill: Cesium.Color.RED,
                strokeWidth: 10,
                clampToGround: true
            });
        }).then(dataSource => {
            return viewer.dataSources.add(dataSource);
        }).then((dataSource) => {

            const initialPosition = {
                heading: parseFloat(track.initialPosition.heading),
                pitch: parseFloat(track.initialPosition.pitch),
                height: parseFloat(track.initialPosition.height)
            }

            viewer.flyTo(dataSource, {
                offset: new Cesium.HeadingPitchRange(initialPosition.heading, initialPosition.pitch, initialPosition.height),
                maximumHeight: maxFlightHeight
            });
            loader.hideLoader();
        });
}

module.exports = {
    loadTrack,
    loadTrackByPath
}