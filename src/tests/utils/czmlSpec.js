const czml = require('../../lib/utils/czml');
const geojsonInput = require('./data.geojson');


describe('czml', () => {
    it('should create czml path from geojson', () => {
        const result = czml.createCzmlPath(geojsonInput);
        const czmlPath = require('./czmlPath.js');
        expect(result).toEqual(czmlPath);
    })
})