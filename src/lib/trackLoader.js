const firebase = require('firebase');
const database = require('./database');
const loader = require('./loader');
const czml = require('./utils/czml')
const animation = require('./animation');

function loadTrackByPath(path, maxFlightHeight) {
    return database.getTrack(path).then(function (track) {
        return loadTrack(track, maxFlightHeight);
    });
}

function loadTrack(track, maxFlightHeight) {
    animation.clearInitialPosition();
    animation.reset();
    const storage = firebase.storage();
    return storage.ref(track.geoJsonPath)
        .getDownloadURL()
        .then((url) => {
            viewer.dataSources.removeAll();
            viewer.clock.shouldAnimate = false;
            var geoJsonReq = new Request(url);
            
            return fetch(geoJsonReq).then((geoJsonFile) => geoJsonFile.json())
            .then(geoJson => {

                const geoJsonDs = Cesium.GeoJsonDataSource.load(geoJson, {
                    stroke: Cesium.Color.RED,
                    fill: Cesium.Color.RED,
                    strokeWidth: 40,
                    clampToGround: true
                });

                const czmlDs = czml.fromGeoJson(geoJson)
                    .then(czmlDoc => {
                        return Cesium.CzmlDataSource.load(czmlDoc)
                    });
                return Promise.all([geoJsonDs, czmlDs]);
            })
        }).then(([geoJsonDs, czmlDs]) => {
            const addGeoJson = viewer.dataSources.add(geoJsonDs);
            const addCzml = viewer.dataSources.add(czmlDs);
            return Promise.all([addGeoJson, addCzml]);
        }).then(([addGeoJson, addCzml]) => {
            addCzml.show = false;

            if(track.initialPosition.position) {
                 const destination = new Cesium.Cartesian3(
                     track.initialPosition.position.x,
                     track.initialPosition.position.y,
                     track.initialPosition.position.z  
                 );
                 const orientation = {
                     heading: parseFloat(track.initialPosition.heading),
                     pitch: parseFloat(track.initialPosition.pitch),
                     roll: parseFloat(track.initialPosition.roll)
                 }
                 animation.setInitialPosition(destination, orientation);
                 return viewer.camera.flyTo({
                    destination,
                    orientation,
                    maxiumumHeight: maxFlightHeight
                });
            } else {
                return viewer.flyTo(addGeoJson);
            }
        });
}

module.exports = {
    loadTrack,
    loadTrackByPath
}