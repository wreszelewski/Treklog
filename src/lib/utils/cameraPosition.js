function getDestination(track) {
    return new Cesium.Cartesian3(
        track.initialPosition.position.x,
        track.initialPosition.position.y,
        track.initialPosition.position.z  
    );
}

function getOrientation(track) {
    return {
        heading: parseFloat(track.initialPosition.heading),
        pitch: parseFloat(track.initialPosition.pitch),
        roll: parseFloat(track.initialPosition.roll)
    }
}

module.exports = {
    getDestination,
    getOrientation
}