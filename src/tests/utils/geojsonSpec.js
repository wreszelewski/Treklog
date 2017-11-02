const {
    getTrackDuration,
    getTrackAltitudeStats,
    getTrackDate,
    getTrackDistance,
    getFilteredTrack,
    gpxStringToGeoJSON
} = require('../../lib/utils/geojson');
const geojsonInput = require('./data.geojson');
const largeGeoJson = require('./dataLarge.geojson');
const multiLineGeoJson = require('./dataMultiLine.geojson');
const fs = require('fs');
const _ = require('lodash');

describe('geojson utils', () => {

    describe('getTrackDuration', () => {
        it('should return proper track duration for LineString input', () => {
            const duration = getTrackDuration(geojsonInput);
            expect(duration).toEqual(8114000);
        });

        it('should return proper track duration for MultiLineString input', () => {
            const duration = getTrackDuration(multiLineGeoJson);
            expect(duration).toEqual(48211000);
        });
    });

    describe('getTrackAltitudeStats', () => {
        it('should return proper altitide stats for LineString input', () => {
            const altitudeStats = getTrackAltitudeStats(geojsonInput);
            expect(altitudeStats.maxAltitude).toEqual(1208);
            expect(altitudeStats.minAltitude).toEqual(584);
            expect(altitudeStats.ascent).toEqual(649);
            expect(altitudeStats.descent).toEqual(28);
        });

        it('should return proper altitide stats for MultiLineString input', () => {
            const altitudeStats = getTrackAltitudeStats(multiLineGeoJson);
            expect(altitudeStats.maxAltitude).toEqual(120);
            expect(altitudeStats.minAltitude).toEqual(38);
            expect(altitudeStats.ascent).toEqual(501);
            expect(altitudeStats.descent).toEqual(512);
        });

        it('should not return altitude stats if no height in geojson', () => {
            let geoJsonNoHeight = _.cloneDeep(geojsonInput);
            geoJsonNoHeight.features[0].geometry.coordinates = geoJsonNoHeight.features[0].geometry.coordinates.map((entry) => entry.slice(0,1));
            const altitudeStats = getTrackAltitudeStats(geoJsonNoHeight);
            expect(altitudeStats.maxAltitude).toEqual(null);
            expect(altitudeStats.minAltitude).toEqual(null);
            expect(altitudeStats.ascent).toEqual(null);
            expect(altitudeStats.descent).toEqual(null);
        })
    });

    describe('getTrackDate', () => {
        it('should return proper track start date', () => {
            const date = getTrackDate(geojsonInput);
            expect(date.toISOString()).toEqual('2017-07-14T07:05:01.000Z');
        });
    })

    describe('getTrackDistance', () => {
        it('should properly calculate track distance', () => {
            const distance = getTrackDistance(geojsonInput);
            expect(distance).toEqual(6099);
        });
    });

    describe('getFilteredTrack', () => {
        it('should return track with points that are at least 25m from each other', () => {
            const track = getFilteredTrack(largeGeoJson);
            expect(track).toEqual(geojsonInput);
        });
    });

    describe('gpxStringToGeoJson', () => {
        it('should convert gpx string to geojson', () => {
            const gpxString = fs.readFileSync(__dirname + '/data.gpx').toString();
            const geojson = gpxStringToGeoJSON(gpxString);
            expect(geojson).toEqual(largeGeoJson);
        })
    });
})