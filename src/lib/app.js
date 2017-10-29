const config = require('./config')

function setUp () {
    "use strict";

    let imageryProviders = [];

    imageryProviders.push(new Cesium.ProviderViewModel({
        name: "Esri World Imagery",
        tooltip: "Esri World Imagery",
        iconUrl: "/assets/img/baseLayerPicker/esriWorldImagery.png",
        creationFunction: () => {
            return new Cesium.ArcGisMapServerImageryProvider({
                url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            });
        }
    }));

    if(config.cesium.providers.mapbox.publicAccessToken) {
        imageryProviders.push(new Cesium.ProviderViewModel({
            name: "Mapbox Satellite",
            tooltip: "Mapbox Satellite",
            iconUrl: "/assets/img/baseLayerPicker/mapboxSatellite.png",
            creationFunction: () => {
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.streets-satellite',
                    accessToken: config.cesium.providers.mapbox.publicAccessToken
                });
            }
        }));

        imageryProviders.push(new Cesium.ProviderViewModel({
            name: "Mapbox Topo",
            tooltip: "Mapbox Topo",
            iconUrl: "/assets/img/baseLayerPicker/mapboxTerrain.png",
            creationFunction: () => {
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.run-bike-hike',
                    accessToken: config.cesium.providers.mapbox.publicAccessToken
                });
            }
        }));
    }

     var viewer = new Cesium.Viewer('cesiumContainer', {
         scene3DOnly: true,
         selectionIndicator: false,
         baseLayerPicker: true,
         geocoder: false,
         homeButton: false,
         infoBox: false,
         sceneModePicker: false,
         timeline: false,
         navigationHelpButton: false,
         navigationInstructionsInitiallyVisible: false,
         clockViewModel: null,
         imageryProviderViewModels: imageryProviders,
         terrainProviderViewModels: [],
         terrainExaggeration: 2.0
     });


     viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
         url : 'https://assets.agi.com/stk-terrain/world',
         requestWaterMask : false,
         requestVertexNormals : false
     });
    
    viewer.scene.globe.depthTestAgainstTerrain = true;
    
    return viewer;
};

module.exports = setUp;

