const { loadTrackByPath } = require('./trackLoader');
const config = require('./config');
const loader = require('./loader');
const animation = require('./animation');

function initialPathLoad() {
    if (window.location.pathname !== "/" && window.location.pathname !== '/admin') {
        loadTrackByPath(window.location.pathname, config.cesium.navigation.maxLinkFlightHeight)
            .then(() => {
                loader.hideLoader();
                if(window.location.pathname !== '/admin') {
                    $('#editTrack').show();
                }
            });
    }

}

window.onpopstate = function (event) {
    if (event.state.treklogModified) {
        loadTrack(event.state.url, config.cesium.navigation.maxLinkFlightHeight);
    }
}

function linkHandler(event, url, mode) {
        event.preventDefault();
        if(!viewer) {
            window.location.replace(getTrackUrl(url,mode));
        } else {
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
    linkHandler,
    getTrackUrl,
    initialPathLoad
}