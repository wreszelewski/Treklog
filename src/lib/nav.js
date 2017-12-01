const { loadTrackByPath } = require('./trackLoader');
const config = require('./config');
const loader = require('./loader');
const animation = require('./animation');

$(document).ready(function () {
    if (window.location.pathname !== "/" && window.location.pathname !== '/admin') {
        loadTrackByPath(window.location.pathname, config.cesium.navigation.maxLinkFlightHeight)
            .then(() => {
                loader.hideLoader();
                if(window.location.pathname !== '/admin') {
                    $('#editTrack').show();
                }
            });
    }
});

window.onpopstate = function (event) {
    if (event.state.treklogModified) {
        loadTrack(event.state.url, config.cesium.navigation.maxLinkFlightHeight);
    }
}

function getTrackLinkHandler(url, mode) {
    return function (event) {
        animation.reset();
        event.preventDefault();
        loader.showLoader();
        $('#trackMenu').modal('hide');
        history.pushState({
            treklogModified: true,
            url: getTrackUrl(url, mode)
        }, '', getTrackUrl(url, mode));
        loadTrackByPath(url, config.cesium.navigation.maxLinkFlightHeight)
            .then(() => {
                loader.hideLoader();
                if(mode === 'admin') {
                    $('#editTrack').show();
                }
            });
    }
}

function getTrackUrl(url, mode) {
    if(!url.startsWith('/')) {
        url = '/' + url;
    }
    if (mode === 'admin') {
        return '/admin' + url;
    } else {
        return url;
    }
}

module.exports = {
    getTrackLinkHandler,
    getTrackUrl
}