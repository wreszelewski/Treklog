const slugify = require('./external/slugify');

function sendFile() {
    var selectedFile = document.getElementById('input').files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var text = reader.result;
        var hash = SparkMD5.hash(text);
        var gpx = (new DOMParser()).parseFromString(text, 'text/xml', null, 4);
        var geoJson = toGeoJSON.gpx(gpx);
        var geoJsonProcessed = JSON.parse(JSON.stringify(geoJson));
        delete geoJsonProcessed.features[0].properties.coordTimes;
        delete geoJsonProcessed.features[0].geometry.coordinates;
        geoJsonProcessed.features[0].properties.coordTimes = [];
        geoJsonProcessed.features[0].geometry.coordinates = [];
        geoJsonProcessed.features[0].geometry.type = 'LineString';
        let coordinates = [];
        let coordTimes = [];

        if(geoJson.features[0].geometry.type === 'LineString') {
            coordinates = geoJson.features[0].geometry.coordinates;
            coordTimes = geoJson.features[0].properties.coordTimes;
        } else {
            geoJson.features[0].geometry.coordinates.forEach(coordArray => {coordinates = coordinates.concat(coordArray)});
            geoJson.features[0].properties.coordTimes.forEach(timesArray => {coordTimes = coordTimes.concat(timesArray)});
        }
        const duration = moment(coordTimes[coordTimes.length - 1]) - moment(coordTimes[0]);
        let lastPointArr = coordinates[0];
        let minAltitude = coordinates[0][2] || null;
        let maxAltitude = coordinates[0][2] | null;
        let ascent = 0;
        let descent = 0;
        let distancePointArr = lastPointArr;
        let currentPointArr;
        coordinates.slice(1).forEach((point) => {
            currentPointArr = point;
            if(currentPointArr[2] > maxAltitude) {
                maxAltitude = currentPointArr[2];
            }
            if(currentPointArr[2] < minAltitude) {
                minAltitude = currentPointArr[2];
            }
            altitudeDiff = distancePointArr[2] - currentPointArr[2];
            if(Math.abs(altitudeDiff) > 8) {
                if(altitudeDiff > 0) {
                    ascent += altitudeDiff;
                } else {
                    descent += Math.abs(altitudeDiff);
                }
                distancePointArr = currentPointArr;
            }
            
        });
        let lastPoint = Cesium.Cartesian3.fromDegrees(lastPointArr[0], lastPointArr[1], lastPointArr[2]);
        geoJsonProcessed.features[0].geometry.coordinates.push(coordinates[0]);
        geoJsonProcessed.features[0].properties.coordTimes.push(coordTimes[0]);
        let currentPoint,
            distance = 0,
            currentDistance;
        let distancePoint = lastPoint;
        coordinates.slice(1).forEach((point) => {
            currentPointArr = point;
            currentPoint = Cesium.Cartesian3.fromDegrees(currentPointArr[0], currentPointArr[1], currentPointArr[2]);
            currentDistance = Cesium.Cartesian3.distance(distancePoint, currentPoint);
            if(currentDistance > 3.5) {
                distance += currentDistance;
                distancePoint = currentPoint;
            }
        });
        coordinates.slice(1).forEach((point, index) => {
            currentPointArr = coordinates[index + 1];
            currentPoint = Cesium.Cartesian3.fromDegrees(currentPointArr[0], currentPointArr[1], currentPointArr[2]);
            currentDistance = Cesium.Cartesian3.distance(lastPoint, currentPoint);
            if(currentDistance > 25) {
                geoJsonProcessed.features[0].geometry.coordinates.push(coordinates[index+1]);
                geoJsonProcessed.features[0].properties.coordTimes.push(coordTimes[index+1]);
                lastPointArr = coordinates[index+1]
                lastPoint = Cesium.Cartesian3.fromDegrees(lastPointArr[0], lastPointArr[1], lastPointArr[2]);
            }

        })
        var date = moment(geoJson.features[0].properties.time);
        var geoJsonPath = 'gpsTracks/' + hash + '.geojson';
        var name = document.getElementById("trackName").value;
        var description = document.getElementById("trackDescription").value;
        var metadata = {
            contentType: 'aplication/json',
        }
        var url = '/' + date.year() + '/' + slugify(name, {lower: true});
        var data = {
            name,
            description,
            date: date.toISOString(),
            geoJsonPath,
            url,
            distance,
            duration,
            ascent,
            descent,
            maxAltitude,
            minAltitude
        }
        firebase.database().ref('tracks' + url).set(data);
        var uploadTask = firebase.storage().ref().child(geoJsonPath).putString(JSON.stringify(geoJsonProcessed), 'raw', metadata);
    }

    reader.readAsText(selectedFile, 'utf-8');
}

module.exports = {
    sendFile
}