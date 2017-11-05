const firebase = require('firebase');
const {
    Track
} = require('./utils/geojson');


function sendFile() {
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        const text = reader.result;
        const track = Track.fromGpx(text);
        track.setName(document.getElementById("trackName").value);
        track.setDescription(document.getElementById("trackDescription").value || '');
        const data = track._serialize();
        const url = data.url;
        const lightGeoJsonPath = data.geoJsonPath;
        const originalGeoJsonPath = data.originalGeoJsonPath;
        const metadata = {
            contentType: 'aplication/json',
        };

        firebase.database().ref('tracks' + url).set(data);
        const lightFileUpload = firebase.storage().ref().child(lightGeoJsonPath).putString(JSON.stringify(track.getFilteredTrack()), 'raw', metadata);
        const originalFileUplaod = firebase.storage().ref().child(originalGeoJsonPath).putString(JSON.stringify(track.originalGeoJson), 'raw', metadata);
    }

    reader.readAsText(selectedFile, 'utf-8');
}



module.exports = {
    sendFile
}