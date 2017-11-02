const firebase = require('firebase');
const slugify = require('./external/slugify');
const {
    gpxStringToGeoJSON,
    getTrackDuration,
    getTrackAltitudeStats,
    getTrackDistance,
    getFilteredTrack,
    getTrackDate
} = require('./utils/geojson');
const SparkMD5 = require('spark-md5');

function sendFile() {
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        const text = reader.result;
        const hash = SparkMD5.hash(text);
        const originalGeoJson = gpxStringToGeoJSON(text);

        const duration = getTrackDuration(originalGeoJson);
        const {
            minAltitude,
            maxAltitude,
            ascent,
            descent
        } = getTrackAltitudeStats(originalGeoJson);
        
        const distance = getTrackDistance(originalGeoJson);
        const filteredGeoJson = getFilteredTrack(originalGeoJson);
        
        const date = getTrackDate(originalGeoJson);
        const lightGeoJsonPath = 'gpsTracks/' + hash + '.geojson';
        const originalGeoJsonPath = 'originalGpsTracks/' + hash + '.geojson';        
        const name = document.getElementById("trackName").value;
        const description = document.getElementById("trackDescription").value;
        const metadata = {
            contentType: 'aplication/json',
        }
        const url = '/' + date.year() + '/' + slugify(name, {lower: true});
        const data = {
            name,
            description,
            date: date.toISOString(),
            geoJsonPath: lightGeoJsonPath,
            originalGeoJsonPath,
            url,
            distance,
            duration,
            ascent,
            descent,
            maxAltitude,
            minAltitude,
            initialPosition: {
                heading: 0,
                pitch: -0.6981317007977318,
                height: 14000
            }
        }
        console.log(data);
        firebase.database().ref('tracks' + url).set(data);
        const lightFileUpload = firebase.storage().ref().child(lightGeoJsonPath).putString(JSON.stringify(filteredGeoJson), 'raw', metadata);
        const originalFileUplaod = firebase.storage().ref().child(originalGeoJsonPath).putString(JSON.stringify(originalGeoJson), 'raw', metadata);
    }

    reader.readAsText(selectedFile, 'utf-8');
}



module.exports = {
    sendFile
}