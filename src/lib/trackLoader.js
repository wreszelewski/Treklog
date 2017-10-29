var storage = firebase.storage();

function loadTrack(path, maxFlightHeight) {
    firebase.database().ref('/tracks' + path).once('value').then(function(snapshot) {
        
          const track = snapshot.val();
          storage.ref(track.geoJsonPath)
              .getDownloadURL()
              .then((url) => {
                  viewer.dataSources.removeAll();
                  var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(0, -40, 0.025883251314954971306);
  
                  let dataSource = Cesium.GeoJsonDataSource.load(url, {
                      stroke: Cesium.Color.RED,
                      fill: Cesium.Color.RED,
                      strokeWidth: 10,
                      clampToGround: true
                    });
                   viewer.dataSources.add(dataSource);
                  viewer.flyTo(dataSource, {offset: new Cesium.HeadingPitchRange(initialOrientation.heading, initialOrientation.pitch, 14000),
                    maximumHeight: maxFlightHeight
                });
              });
      });
}

module.exports = {
    loadTrack
}