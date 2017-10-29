const { getTrackLinkHandler } = require('./nav');

function renderUserTrackList() {
    renderTrackList('user');
}

function renderAdminTrackList() {
    renderTrackList('admin');
}

function renderTrackList(mode) {
    firebase.database().ref('/tracks/').once('value').then(function(dbTracks) {
        const tracks = dbTracks.val();
        let trackList = document.getElementById('trackList');
        const trackObjects = getTrackList(tracks, mode);
        let preloader = document.getElementById('trackListPreloader');
        preloader.parentElement.removeChild(preloader);
        trackObjects.forEach(track => trackList.appendChild(track));
      });
}

function getTrackList(tracksPerYear, mode) {
    let trackList = [];
    const years = Object.getOwnPropertyNames(tracksPerYear)
        .sort()
        .reverse();

    years.forEach((year) => {
        const trackCodesInYear = Object.getOwnPropertyNames(tracksPerYear[year])
            .sort(getDateComparator(tracksPerYear[year]));

        trackCodesInYear.forEach((trackCode) => {
            const trackListElement = createTrackListElement(tracksPerYear[year][trackCode], mode)
            trackList.push(trackListElement);
        });
    ;})

    return trackList;
}

function getDateComparator(tracks) {
    return function dateComparator(a, b) {
        return moment(tracks[b].date) - moment(tracks[a].date);
    }
}

function createTrackListElement(track, mode) {

    let trackListElement = document.createElement('a');
    trackListElement.href = getTrackUrl(track.url, mode);
    trackListElement.addEventListener('click', getTrackLinkHandler(track.url));
    trackListElement.className = "collection-item avatar";

    let icon = document.createElement('i');
    icon.className = 'material-icons circle green';
    icon.innerHTML = 'terrain';
    trackListElement.appendChild(icon);

    let name = document.createElement('span');
    name.className = "title";
    name.innerHTML = track.name + ' - ' + moment(track.date).calendar();

    trackListElement.appendChild(name);
    let description = document.createElement('p');
    description.innerHTML = track.description;
    trackListElement.appendChild(description);

    return trackListElement;
}

function getTrackUrl(url, mode) {
    if(mode === 'admin') {
        return '/admin' + url;
    } else {
        return url;
    }
}

module.exports = {
    renderUserTrackList,
    renderAdminTrackList
}