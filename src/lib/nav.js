const loadTrack = require('./trackLoader').loadTrack
const config = require('./config')

$(document).ready(function(){
    $('.modal').modal();
    if(window.location.pathname === "/" || window.location.pathname === '/admin.html') {
        $('#trackMenu').modal('open');
    }
});

window.onpopstate = function(event) {
    if(event.state.treklogModified) {
        loadTrack(event.state.url)
    }
}

function getTrackLinkHandler(url) {
    return function(event) {
        event.preventDefault();
        loadTrack(url, config.cesium.navigation.maxLinkFlightHeight);
        $('#trackMenu').modal('close');
        history.pushState({
            treklogModified: true,
            url
        }, '', url);
    }
}

module.exports = {
    getTrackLinkHandler
}