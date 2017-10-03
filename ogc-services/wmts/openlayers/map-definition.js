var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);

for (var z = 0; z < 14; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = 'EPSG:3857:' + z;
}


function defineMap(requestParam, ) {

    //if (config) {
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
                opacity: 1
            }),
            new ol.layer.Tile({
                opacity: 1,
                source: new ol.source.WMTS({
                    url: 'https://services.digitalglobe.com/earthservice/wmtsaccess?connectid=CONNECT_ID&featureProfile=Accuracy_Profile',
                    layer: 'DigitalGlobe:ImageryTileService',
                    matrixSet: 'EPSG:3857',
                    format: 'image/jpeg',
                    projection: projection,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: ol.extent.getTopLeft(projectionExtent),
                        resolutions: resolutions,
                        matrixIds: matrixIds
                    }),
                    style: '',
                    wrapX: true
                })
            })
        ],
        target: 'map',
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }),
        view: new ol.View({
            center: [-11158582, 4813697],
            zoom: 4
        })
    });
    //}

}