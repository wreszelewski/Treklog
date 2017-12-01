const mockery = require('mockery');

const geojsonInput = require('./data.geojson');


describe('czml', () => {

    beforeEach(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        
        const terrainMock = {
            getCesiumTerrainForGeoJson: () => {
                return Promise.resolve(Array(2000).fill({height: 1}))
            }
        }
        mockery.registerMock('./terrain', terrainMock);
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should create czml path from geojson', (finishTest) => {
        const czml = require('../../lib/utils/czml');        
        czml.createCzmlPath(geojsonInput)
            .then(result => {
                const czmlPath = require('./czmlPath.js');
                expect(result).toEqual(czmlPath);
                finishTest();
            });
    })
})