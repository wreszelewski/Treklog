
function getCesiumTerrainForGeoJson(geojson) {
    const pathCartographic = geojson.features[0].geometry.coordinates.map(point => new Cesium.Cartographic.fromDegrees(point[0], point[1]));
    return Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, pathCartographic);
}

module.exports = {
    getCesiumTerrainForGeoJson
}