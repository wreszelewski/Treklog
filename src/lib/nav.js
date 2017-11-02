const loadTrack = require('./trackLoader').loadTrack;
const config = require('./config');
const loader = require('./loader');

$(document).ready(function () {
    $('.modal').modal();
    if (window.location.pathname !== "/" && !window.location.pathname !== '/admin') {
        loadTrack(window.location.pathname, config.cesium.navigation.maxLinkFlightHeight);
    }
});

window.onpopstate = function (event) {
    if (event.state.treklogModified) {
        loadTrack(event.state.url, config.cesium.navigation.maxLinkFlightHeight);
    }
}

function getTrackLinkHandler(url) {
    return function (event) {
        event.preventDefault();
        loader.showLoader();
        loadTrack(url, config.cesium.navigation.maxLinkFlightHeight);
        $('#trackMenu').modal('hide');
        history.pushState({
            treklogModified: true,
            url
        }, '', url);
    }
}

module.exports = {
    getTrackLinkHandler
}