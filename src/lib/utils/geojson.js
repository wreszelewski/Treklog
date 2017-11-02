const toGeoJSON = require('togeojson');
const moment = require('moment');
const geolib = require('geolib');

function gpxStringToGeoJSON(gpxString) {
    const gpx = (new DOMParser()).parseFromString(gpxString, 'text/xml', null, 4);
    return toGeoJSON.gpx(gpx);
}

function getGeoJsonWithoutPoints(geoJson) {
    let geoJsonProcessed = JSON.parse(JSON.stringify(geoJson));
    delete geoJsonProcessed.features[0].properties.coordTimes;
    delete geoJsonProcessed.features[0].geometry.coordinates;
    geoJsonProcessed.features[0].properties.coordTimes = [];
    geoJsonProcessed.features[0].geometry.coordinates = [];
    geoJsonProcessed.features[0].geometry.type = 'LineString';
    return geoJsonProcessed;
}

function getCoordinates(geoJson) {
    if(geoJson.features[0].geometry.type === 'LineString') {
        return geoJson.features[0].geometry.coordinates;
    } else {
        let coordinates = []
        geoJson.features[0].geometry.coordinates.forEach(coordArray => {coordinates = coordinates.concat(coordArray)});
        return coordinates;
    }
}

function getCoordTimes(geoJson) {
    if(geoJson.features[0].geometry.type === 'LineString') {
        return geoJson.features[0].properties.coordTimes;
    } else {
        let coordTimes = []
        geoJson.features[0].properties.coordTimes.forEach(timesArray => {coordTimes = coordTimes.concat(timesArray)});
        return coordTimes;
    }
}

function getTrackDuration(geoJson) {
    const coordTimes = getCoordTimes(geoJson);
    return moment(coordTimes[coordTimes.length - 1]) - moment(coordTimes[0]);
}

function getTrackAltitudeStats(geoJson) {
    const coordinates = getCoordinates(geoJson);
    if(!coordinates[0][2]) {
        return {
            minAltitude: null,
            maxAltitude: null,
            ascent: null,
            descent: null
        };
    }
    const altitudes = coordinates.map(coordinate => coordinate[2]);
    let minAltitude = altitudes[0]
    let maxAltitude = altitudes[0]
    let ascent = 0;
    let descent = 0;
    let lastAltitude = altitudes[0];

    altitudes.slice(1).forEach((currentAltitude) => {
        if(currentAltitude > maxAltitude) {
            maxAltitude = currentAltitude;
        }
        if(currentAltitude < minAltitude) {
            minAltitude = currentAltitude;
        }
        const altitudeDiff = currentAltitude - lastAltitude;
        if(Math.abs(altitudeDiff) > 8) {
            if(altitudeDiff > 0) {
                ascent += altitudeDiff;
            } else {
                descent += Math.abs(altitudeDiff);
            }
            lastAltitude = currentAltitude;
        } 
    });

    return {
        minAltitude,
        maxAltitude,
        ascent,
        descent
    };
}

function getTrackDistance(geoJson) {
    const coordinates = getCoordinates(geoJson);    
    let lastPointArr = coordinates[0];
    let lastPoint = {latitude: lastPointArr[1], longitude: lastPointArr[0]};
    let currentPoint,
    distance = 0,
    currentDistance;
    let distancePoint = lastPoint;
    coordinates.slice(1).forEach((point) => {
        currentPointArr = point;
        currentPoint = {latitude: currentPointArr[1], longitude: currentPointArr[0]};
        currentDistance = geolib.getDistance(distancePoint, currentPoint);
        distance += currentDistance;
        distancePoint = currentPoint;
    });
    return distance;
}

function getFilteredTrack(geoJson) {
    let lightGeoJson = getGeoJsonWithoutPoints(geoJson);

    const coordinates = getCoordinates(geoJson);
    const coordTimes = getCoordTimes(geoJson);    

    let lastPointArr = coordinates[0];
    let lastPoint = {latitude: lastPointArr[1], longitude: lastPointArr[0]};
    let currentPoint, currentPointArr, currentDistance;

    coordinates.slice(1).forEach((point, index) => {
        currentPointArr = coordinates[index + 1];
        currentPoint = {latitude: currentPointArr[1], longitude: currentPointArr[0]};
        currentDistance = geolib.getDistance(lastPoint, currentPoint);
        if(currentDistance > 25) {
            lightGeoJson.features[0].geometry.coordinates.push(coordinates[index+1]);
            lightGeoJson.features[0].properties.coordTimes.push(coordTimes[index+1]);
            lastPointArr = coordinates[index+1]
            lastPoint = {latitude: lastPointArr[1], longitude: lastPointArr[0]};
        }

    })
    return lightGeoJson;
}

function getTrackDate(geoJson) {
    return moment(geoJson.features[0].properties.time)
}

module.exports = {
    gpxStringToGeoJSON,
    getTrackDuration,
    getTrackAltitudeStats,
    getTrackDistance,
    getFilteredTrack,
    getTrackDate
}