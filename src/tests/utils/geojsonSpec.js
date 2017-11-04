const {
    Track
} = require('../../lib/utils/geojson');
const geojsonInput = require('./data.geojson');
const largeGeoJson = require('./dataLarge.geojson');
const multiLineGeoJson = require('./dataMultiLine.geojson');
const fs = require('fs');
const _ = require('lodash');

describe('Track', () => {

    describe('getDuration', () => {
        it('should return proper track duration for LineString input', () => {
            const track = new Track(geojsonInput);
            const duration = track.getDuration();
            expect(duration).toEqual(8139000);
        });

        it('should return proper track duration for MultiLineString input', () => {
            const track = new Track(multiLineGeoJson);
            const duration = track.getDuration();
            expect(duration).toEqual(48211000);
        });
    });

    describe('getTrackAltitudeStats', () => {
        it('should return proper altitide stats for LineString input', () => {
            const track = new Track(geojsonInput);
            const altitudeStats = track.getTrackAltitudeStats();
            expect(altitudeStats.maxAltitude).toEqual(1208);
            expect(altitudeStats.minAltitude).toEqual(584);
            expect(altitudeStats.ascent).toEqual(650);
            expect(altitudeStats.descent).toEqual(28);
        });

        it('should return proper altitide stats for MultiLineString input', () => {
            const track = new Track(multiLineGeoJson);
            const altitudeStats = track.getTrackAltitudeStats();
            expect(altitudeStats.maxAltitude).toEqual(120);
            expect(altitudeStats.minAltitude).toEqual(38);
            expect(altitudeStats.ascent).toEqual(501);
            expect(altitudeStats.descent).toEqual(512);
        });

        it('should not return altitude stats if no height in geojson', () => {
            let geoJsonNoHeight = _.cloneDeep(geojsonInput);
            geoJsonNoHeight.features[0].geometry.coordinates = geoJsonNoHeight.features[0].geometry.coordinates.map((entry) => entry.slice(0,1));
            const track = new Track(geoJsonNoHeight);
            const altitudeStats = track.getTrackAltitudeStats();
            expect(altitudeStats.maxAltitude).toEqual(null);
            expect(altitudeStats.minAltitude).toEqual(null);
            expect(altitudeStats.ascent).toEqual(null);
            expect(altitudeStats.descent).toEqual(null);
        })
    });

    describe('getTrackDate', () => {
        it('should return proper track start date', () => {
            const track = new Track(geojsonInput);
            const date = track.getTrackDate();
            expect(date.toISOString()).toEqual('2017-07-14T07:05:01.000Z');
        });
    })

    describe('getTrackDistance', () => {
        it('should properly calculate track distance', () => {
            const track = new Track(geojsonInput);
            const distance = track.getTrackDistance();
            expect(distance).toEqual(6130);
        });
    });

    describe('getFilteredTrack', () => {
        it('should return track with points that are at least 25m from each other', () => {
            const track = new Track(largeGeoJson);
            const lightTrack = track.getFilteredTrack();
            expect(lightTrack).toEqual(geojsonInput);
        });
    });

    describe('fromGpx', () => {
        it('should convert gpx string to geojson', () => {
            const gpxString = fs.readFileSync(__dirname + '/data.gpx').toString();
            const track = Track.fromGpx(gpxString);
            expect(track.originalGeoJson).toEqual(largeGeoJson);
        })
    });
})