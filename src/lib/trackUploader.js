const {
    Track
} = require('./utils/geojson');
const { loadTrack } = require('./trackLoader');
const loader = require('./loader');

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
    loader.showLoader();
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        const text = reader.result;
        const track = Track.fromGpx(text);
        track.setName(document.getElementById("trackName").value);
        track.setDescription(document.getElementById("trackDescription").value || '');
        $('#addTrack').modal('hide');
        track.store()
            .then(() => {
                history.pushState({
                    treklogModified: true,
                    url: '/admin' + track.url
                }, '', '/admin' + track.url);
                return loadTrack(track)
            }).then(() => {
                loader.hideLoader();
                
                $('#editTrack').show();
            });
    }

    reader.readAsText(selectedFile, 'utf-8');
}



module.exports = {
    sendFile,
    loadFile
}