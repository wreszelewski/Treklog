const toGeoJSON = require('togeojson');
const moment = require('moment');
const geolib = require('geolib');

class Track {

    static fromGpx(gpxString) {
        const gpx = (new DOMParser()).parseFromString(gpxString, 'text/xml', null, 4);
        const geojson = toGeoJSON.gpx(gpx);
        const track = new Track(geojson);
        return track;
    }

    constructor(originalGeoJson) {
        this.originalGeoJson = originalGeoJson;
        this._coordinates = this._getCoordinates();
        this._coordTimes = this._getCoordTimes();
    }

    _getCoordinates() {
        if(this.originalGeoJson.features[0].geometry.type === 'LineString') {
            return this.originalGeoJson.features[0].geometry.coordinates;
        } else {
            let coordinates = []
            this.originalGeoJson.features[0].geometry.coordinates.forEach(coordArray => {coordinates = coordinates.concat(coordArray)});
            return coordinates;
        }
    }

    _getCoordTimes() {
        if(this.originalGeoJson.features[0].geometry.type === 'LineString') {
            return this.originalGeoJson.features[0].properties.coordTimes;
        } else {
            let coordTimes = []
            this.originalGeoJson.features[0].properties.coordTimes.forEach(timesArray => {coordTimes = coordTimes.concat(timesArray)});
            return coordTimes;
        }
    }

    getDuration() {
        return moment(this._coordTimes[this._coordTimes.length - 1]) - moment(this._coordTimes[0]);
    }

    getTrackAltitudeStats(geoJson) {
        const coordinates = this._coordinates;
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

    getTrackDate() {
        return moment(this.originalGeoJson.features[0].properties.time)
    }

    getTrackDistance() {
        const coordinates = this._coordinates;    
        let lastPoint = getGeolibPoint(coordinates[0]);
        let currentPoint,
        distance = 0,
        currentDistance;
        let distancePoint = lastPoint;
        coordinates.slice(1).forEach((point) => {
            currentPoint = getGeolibPoint(point);
            currentDistance = geolib.getDistance(distancePoint, currentPoint);
            distance += currentDistance;
            distancePoint = currentPoint;
        });
        return distance;
    }

    _getGeoJsonWithoutPoints() {
        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        name: this.originalGeoJson.features[0].properties.name,
                        time: this.originalGeoJson.features[0].properties.time,
                        coordTimes: [],
                        links: [{
                            href: this.originalGeoJson.features[0].properties.links[0].href
                        }]
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: []
                    }
                }
            ]
        };
    }

    getFilteredTrack() {
        let lightGeoJson = this._getGeoJsonWithoutPoints();
    
        const coordinates = this._coordinates;
        const coordTimes = this._coordTimes;    
    
        this._pushPointToTrack(lightGeoJson, 0)
    
        let lastPoint = getGeolibPoint(coordinates[0]);
        let currentPoint, currentDistance;
    
        coordinates.slice(1).forEach((point, index) => {
            currentPoint = getGeolibPoint(coordinates[index+1]);
            currentDistance = geolib.getDistance(lastPoint, currentPoint);
            if(currentDistance > 25) {
                this._pushPointToTrack(lightGeoJson, index+1);
                lastPoint = currentPoint;
            }
    
        })
        return lightGeoJson;
    }

    _pushPointToTrack(track, index) {
        track.features[0].geometry.coordinates.push(this._coordinates[index]);
        track.features[0].properties.coordTimes.push(this._coordTimes[index]);
    } 

}



function getGeolibPoint(coordinate) {
    return {
        latitude: coordinate[1],
        longitude: coordinate[0]
    }
}


module.exports = {
    Track
}