const {
    Track
} = require('./utils/geojson');
const { loadTrack } = require('./trackLoader');

function loadFile() {
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        const text = reader.result;
        const track = Track.fromGpx(text);
        const trackName = document.getElementById("trackName");
        if(trackName.value === '') {
            trackName.value = track.originalName;
        }
        
    }

    reader.readAsText(selectedFile, 'utf-8');
}

function sendFile() {
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        const text = reader.result;
        const track = Track.fromGpx(text);
        track.setName(document.getElementById("trackName").value);
        track.setDescription(document.getElementById("trackDescription").value || '');
        track.store()
            .then(loadTrack(track));
    }

    reader.readAsText(selectedFile, 'utf-8');
}



module.exports = {
    sendFile,
    loadFile
}