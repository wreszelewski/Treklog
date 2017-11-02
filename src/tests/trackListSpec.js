const mockery = require('mockery');
const browserEnv = require('./helpers/browserEnv');

describe("trackList", function() {
  
  let TrackList;

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    navMock = jasmine.createSpyObj('nav', ['getTrackLinkHandler']);
    navMock.getTrackLinkHandler.andReturn(() => {});
    mockery.registerMock('./nav', navMock);
    TrackList = require('../lib/trackList');
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe("createTrackList", () => {
    it('should create properly formatted user DOM Element', () => {

      const tracksPerYear = {
        2017: {
          test: {
            date: '2017-09-02T06:06:03.000Z',
            description: 'test',
            geoJsonPath: 'gpsTracks/test.geojson',
            name: 'test',
            url: '2017/test'
          }
        }
      };
      const mode = 'user';

      const trackList = TrackList.createTrackList(tracksPerYear, mode);
      let wrapper = document.createElement('div');
      wrapper.appendChild(trackList[0]);
      expect(wrapper.innerHTML).toEqual('<div class="item"><div class="content"><div class="header">test - 02.09.2017</div><div>test</div></div></div>');
      expect(navMock.getTrackLinkHandler).toHaveBeenCalledWith('2017/test');

    });

    it('should create properly formatted admin DOM Element', () => {
      
            const tracksPerYear = {
              2017: {
                test: {
                  date: '2017-09-02T06:06:03.000Z',
                  description: 'test',
                  geoJsonPath: 'gpsTracks/test.geojson',
                  name: 'test',
                  url: '2017/test'
                }
              }
            };
            const mode = 'admin';
      
            const trackList = TrackList.createTrackList(tracksPerYear, mode);
            let wrapper = document.createElement('div');
            wrapper.appendChild(trackList[0]);
            expect(wrapper.innerHTML).toEqual('<div class="item"><div class="content"><div class="header">test - 02.09.2017</div><div>test</div></div></div>');
            expect(navMock.getTrackLinkHandler).toHaveBeenCalledWith('admin/2017/test');
      
    });

    it('should create properly formatted user DOM Element when url starts with /', () => {
      
            const tracksPerYear = {
              2017: {
                test: {
                  date: '2017-09-02T06:06:03.000Z',
                  description: 'test',
                  geoJsonPath: 'gpsTracks/test.geojson',
                  name: 'test',
                  url: '/2017/test'
                }
              }
            };
            const mode = 'user';
      
            const trackList = TrackList.createTrackList(tracksPerYear, mode);
            let wrapper = document.createElement('div');
            wrapper.appendChild(trackList[0]);
            expect(wrapper.innerHTML).toEqual('<div class="item"><div class="content"><div class="header">test - 02.09.2017</div><div>test</div></div></div>');
            expect(navMock.getTrackLinkHandler).toHaveBeenCalledWith('2017/test');
      
          });

    it('should create multiple elements sorted by created date', () => {
      const tracksPerYear = {
        2016: {
          test1: {
            date: '2016-09-02T06:06:03.000Z',
            description: 'test1',
            geoJsonPath: 'gpsTracks/test1.geojson',
            name: 'test1',
            url: '2016/test1'
          }
        },
        2017: {
          test2: {
            date: '2017-08-02T06:06:03.000Z',
            description: 'test2',
            geoJsonPath: 'gpsTracks/test2.geojson',
            name: 'test2',
            url: '2017/test2'
          },
          test3: {
            date: '2017-09-02T06:06:03.000Z',
            description: 'test3',
            geoJsonPath: 'gpsTracks/test3.geojson',
            name: 'test3',
            url: '2017/test3'
          }
        }
        
      };
      const mode = 'user';

      const trackList = TrackList.createTrackList(tracksPerYear, mode);
      const names = trackList.map((track => track.href));
      expect(names).toEqual(['2017/test3', '2017/test2', '2016/test1']);
    })
  });
    
});