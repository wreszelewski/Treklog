const mockery = require('mockery');
require('./helpers/browserEnv');
const moment = require('moment');

describe('database', () => {
    
    let firebaseMock, database;

    beforeEach(() => {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false,
            useCleanCache: true
        });
        localStorage.clean();
        firebaseMock = jasmine.createSpyObj('firebaseMock', ['getTracksRaw', 'storeFile', 'storeTrackMetadata']);
        mockery.registerMock('./utils/firebase', firebaseMock);
        database = require('../lib/database');
    });

    afterEach(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    describe('tracks metadata', () => {
        it('should get list of all tracks from db and store it in cache if not in cache', (finishTest) => {

            const tracksMock = {
                '2017': {
                    'test-test':
                    {
                        a: 'b'
                    }
                }
            }

            firebaseMock.getTracksRaw.andReturn(Promise.resolve(tracksMock));

            database.getTracks()
                .then((tracks) => {
                    expect(tracks).toEqual(tracksMock);
                    expect(JSON.parse(localStorage.getItem('tracks')).tracks).toEqual(tracksMock);
                    expect(firebaseMock.getTracksRaw).toHaveBeenCalled();
                    finishTest();
                }).catch(error => {
                    finishTest(error);
                })
        });

        it('should get list of all tracks from db and store it in cache if cache is outdated', (finishTest) => {
            
            const tracksMock = {
                '2017': {
                    'test-test':
                    {
                        a: 'b'
                    }
                }
            }
            const twoHoursBefore = moment();
            twoHoursBefore.subtract(2, 'hours');
            const cacheContent = {
                refreshDate: twoHoursBefore.toISOString(),
                tracks: {
                    '2017': {
                        'test-test': { a: 'c' }
                    }
                }
            }

            localStorage.setItem('tracks', JSON.stringify(cacheContent));
            firebaseMock.getTracksRaw.andReturn(Promise.resolve(tracksMock));
            
            database.getTracks()
                .then((tracks) => {
                    expect(tracks).toEqual(tracksMock);
                    expect(JSON.parse(localStorage.getItem('tracks')).tracks).toEqual(tracksMock);
                    expect(firebaseMock.getTracksRaw).toHaveBeenCalled();
                    finishTest();
                }).catch(error => {
                    finishTest(error);
                })
        })

        it('should get list of all tracks from cache if cache is fresh', (finishTest) => {

            const cacheContent = {
                refreshDate: moment().toISOString(),
                tracks: {
                    '2017': {
                        'test-test': { a: 'c' }
                    }
                }
            }

            localStorage.setItem('tracks', JSON.stringify(cacheContent));

            database.getTracks()
                .then((tracks) => {
                    expect(tracks).toEqual(cacheContent.tracks);
                    expect(JSON.parse(localStorage.getItem('tracks')).tracks).toEqual(cacheContent.tracks);
                    expect(firebaseMock.getTracksRaw).not.toHaveBeenCalled();
                    finishTest();
                }).catch(error => {
                    finishTest(error);
                })
        });

        it('should return track from path with "/" at start', (finishTest) => {
            const cacheContent = {
                refreshDate: moment().toISOString(),
                tracks: {
                    '2017': {
                        'test-test': { a: 'c' }
                    }
                }
            }

            localStorage.setItem('tracks', JSON.stringify(cacheContent));

            database.getTrack('/2017/test-test')
                .then((track) => {
                    expect(track).toEqual({a: 'c'});
                    finishTest();
                })
        });

        it('should return track from path without "/" at start', (finishTest) => {
            const cacheContent = {
                refreshDate: moment().toISOString(),
                tracks: {
                    '2017': {
                        'test-test': { a: 'c' }
                    }
                }
            }

            localStorage.setItem('tracks', JSON.stringify(cacheContent));

            database.getTrack('2017/test-test')
                .then((track) => {
                    expect(track).toEqual({a: 'c'});
                    finishTest();
                })
        });
    });

    describe('track storage', () => {
        it('should store track', (finishTest) => {
            firebaseMock.storeFile.andReturn(Promise.resolve());
            firebaseMock.storeTrackMetadata.andReturn(Promise.resolve());

            data = {
                geoJsonPath: "/test/test",
                originalGeoJsonPath: "/original/test",
                url: "/2017/test"
            }

            database.storeTrack(data, 'filteredTrack', 'originalTrack')
                .then(() => {
                    expect(firebaseMock.storeFile).toHaveBeenCalledWith("/test/test", "filteredTrack", {contentType: 'application/json'});
                    expect(firebaseMock.storeFile).toHaveBeenCalledWith("/original/test", "originalTrack", {contentType: 'application/json'});
                    expect(firebaseMock.storeTrackMetadata).toHaveBeenCalledWith("/2017/test", data);
                    finishTest();
                })
        })
    });
})