const {
    Track
} = require('../../lib/utils/geojson');
const geojsonInput = require('./data.geojson');
const largeGeoJson = require('./dataLarge.geojson');
const multiLineGeoJson = require('./dataMultiLine.geojson');
const fs = require('fs');
const _ = require('lodash');
const mockery = require('mockery');

describe('Track', () => {

    let storeTrackMock, Track;

    beforeEach(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        
        storeTrackMock = {
            storeTrack: jasmine.createSpy().andReturn(Promise.resolve())
        }
        mockery.registerMock('../database', storeTrackMock);

        const czmlMock = {
            fromGeoJson: () => {test: 'a'}
        }
        mockery.registerMock('./czml', czmlMock);
        Track = require('../../lib/utils/geojson').Track;
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('getDuration', () => {
        it('should return proper track duration for LineString input', () => {
            const track = new Track(geojsonInput);
            expect(track.duration).toEqual(8139000);
        });

        it('should return proper track duration for MultiLineString input', () => {
            const track = new Track(multiLineGeoJson);
            expect(track.duration).toEqual(48211000);
        });
    });

    describe('getTrackAltitudeStats', () => {
        it('should return proper altitide stats for LineString input', () => {
            const track = new Track(geojsonInput);
            expect(track.altitudeStats.maxAltitude).toEqual(1208);
            expect(track.altitudeStats.minAltitude).toEqual(584);
            expect(track.altitudeStats.ascent).toEqual(650);
            expect(track.altitudeStats.descent).toEqual(28);
        });

        it('should return proper altitide stats for MultiLineString input', () => {
            const track = new Track(multiLineGeoJson);
            expect(track.altitudeStats.maxAltitude).toEqual(120);
            expect(track.altitudeStats.minAltitude).toEqual(38);
            expect(track.altitudeStats.ascent).toEqual(501);
            expect(track.altitudeStats.descent).toEqual(512);
        });

        it('should not return altitude stats if no height in geojson', () => {
            let geoJsonNoHeight = _.cloneDeep(geojsonInput);
            geoJsonNoHeight.features[0].geometry.coordinates = geoJsonNoHeight.features[0].geometry.coordinates.map((entry) => entry.slice(0,1));
            const track = new Track(geoJsonNoHeight);
            expect(track.altitudeStats.maxAltitude).toEqual(null);
            expect(track.altitudeStats.minAltitude).toEqual(null);
            expect(track.altitudeStats.ascent).toEqual(null);
            expect(track.altitudeStats.descent).toEqual(null);
        })
    });

    describe('getTrackDate', () => {
        it('should return proper track start date', () => {
            const track = new Track(geojsonInput);
            expect(track.date.toISOString()).toEqual('2017-07-14T07:05:01.000Z');
        });
    })

    describe('getTrackDistance', () => {
        it('should properly calculate track distance', () => {
            const track = new Track(geojsonInput);
            expect(track.distance).toEqual(6130);
        });
    });

    describe('getFilteredTrack', () => {
        it('should return track with points that are at least 25m from each other', () => {
            const track = new Track(largeGeoJson);
            track.setName("Międzygórze - Schronisko PTTK \"Na Śnieżniku\"");
            expect(track.filteredTrack).toEqual(geojsonInput);
        });
    });

    describe('getOriginalName', () => {
        it('should get original name', () => {
            const track = new Track(largeGeoJson);
            expect(track.originalName).toEqual("Międzygórze - Schronisko PTTK \"Na Śnieżniku\"");
        });
    });

    describe('setters', () => {
        it('should set name', () => {
            const track = new Track(geojsonInput);
            track.setName('test');
            expect(track.name).toEqual('test');
        });

        it('should set description', () => {
            const track = new Track(geojsonInput);
            track.setDescription('test');
            expect(track.description).toEqual('test');
        });
    });

    describe('paths', () => {
        it('should return filtered geoJson path', () => {
            const track = new Track(geojsonInput);
            expect(track.geoJsonPath).toEqual('gpsTracks/0bcc19ef73785098f1c9391cb6c8e92a.geojson');
        });

        it('should return original geoJson path', () => {
            const track = new Track(geojsonInput);
            expect(track.originalGeoJsonPath).toEqual('originalGpsTracks/0bcc19ef73785098f1c9391cb6c8e92a.geojson');
        });

        it('should return track url', () => {
            const track = new Track(geojsonInput);
            track.setName('test');
            expect(track.url).toEqual('/2017/test');
        });
    });


    describe('fromGpx', () => {
        it('should convert gpx string to geojson', () => {
            const gpxString = fs.readFileSync(__dirname + '/data.gpx').toString();
            const track = Track.fromGpx(gpxString);
            expect(track.originalGeoJson).toEqual(largeGeoJson);
        })
    });

    describe('store', () => {
        it('should store appropriate data in firebase', (finishTest) => {
            const track = new Track(geojsonInput);
            track.setName('test');
            track.setDescription('test');

            const data = {
                name: 'test',
                description: 'test',
                minAltitude: 584,
                maxAltitude: 1208,
                ascent: 650,
                descent: 28,
                url: '/2017/test',
                date: '2017-07-14T07:05:01.000Z',
                distance: 6130,
                duration: 8139000,
                geoJsonPath: 'gpsTracks/0bcc19ef73785098f1c9391cb6c8e92a.geojson',
                originalGeoJsonPath: 'originalGpsTracks/0bcc19ef73785098f1c9391cb6c8e92a.geojson',
                initialPosition: {
                    heading: 0,
                    pitch: -0.6981317007977318,
                    height: 14000
                }
            };

            track.store()
                .then(() => {
                    expect(storeTrackMock.storeTrack).toHaveBeenCalledWith(data, track.filteredTrack, track.originalGeoJson);
                    finishTest();
                });
        });
    });
})