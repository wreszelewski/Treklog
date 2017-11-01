const { getTrackLinkHandler } = require('./nav');
const moment = require('moment');

function createTrackList(tracksPerYear, mode) {
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
    })

    return trackList;
}

function getDateComparator(tracks) {
    return function dateComparator(a, b) {
        return moment(tracks[b].date) - moment(tracks[a].date);
    }
}

function createTrackListElement(track, mode) {

    let trackListElement = document.createElement('div');
    trackListElement.href = getTrackUrl(track.url, mode);
    trackListElement.addEventListener('click', getTrackLinkHandler(track.url));
    trackListElement.className = "item";

    let content = document.createElement('div');
    content.className = "content";

    let name = document.createElement('div');
    name.className = "header";
    name.innerHTML = track.name + ' - ' + moment(track.date).locale('pl').calendar();
    content.appendChild(name);

    let description = document.createElement('div');
    description.class = "description";
    description.innerHTML = track.description;
    content.appendChild(description);

    trackListElement.appendChild(content);

    return trackListElement;
}

function getTrackUrl(url, mode) {
    if (mode === 'admin') {
        return 'admin/' + url;
    } else {
        return url;
    }
}

module.exports = {
    createTrackList
}