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


/** layers do mapa: OSM (OpenStreetmap) e DG (Digital Globe) */
var osmLayer;
var dgLayer;

/** opacidade */
var opacidadeOSM = 1; // OSM
var opacidadeDG = 1; // Digital Globe


/** valores default para as configurações da camada da Digital Globe **/
var baseUrl = 'https://services.digitalglobe.com/earthservice/wmtsaccess?';
var connectid = 'CONNECT_ID';
var featureProfile = 'Accuracy_Profile';
var fullUrl = baseUrl + 'connectid=' + connectid + '&' + 'featureProfile=' + featureProfile;
var format = 'image/jpeg';
var Coverage_CQL_Filter;


/** filtros (Coverage_CQL_Filter) para a camada da Digital Globe */
var productType;
var cloudCover;
var ageDays;
var source;


/** aplicar valores do filtro nas variáveis */
function configFilter() {

    productType = $('#productType').val();
    cloudCover = $('#cloudCover').val();
    ageDays = $('#ageDays').val();
    source = $('#source').val();
}

/** limpar valores dos filtros nas variáveis */
function clearConfigFilter() {

    productType = '';
    cloudCover = '';
    ageDays = '';
    source = '';
}


function applyFilter() {

    format = $('#format').val();
    connectid = $('#connectid').val();
    featureProfile = $('#featureProfile').val();

    opacidadeOSM = $('#opacidadeOSM').val();
    opacidadeDG = $('#opacidadeDG').val();

    fullUrl = baseUrl + 'connectid=' + connectid + '&' + 'featureProfile=' + featureProfile;

    if (productType || cloudCover || ageDays || source) {

        Coverage_CQL_Filter = '&Coverage_CQL_Filter=';

        var cql = '';

        if (productType) {
            cql += '(productType = ' + productType + ")";
        }

        if (cloudCover) {
            if (cql) {
                cql += ' AND ';
            }
            cql += '(cloudCover < ' + cloudCover + ")";
        }

        if (ageDays) {
            if (cql) {
                cql += ' AND ';
            }
            cql += '(ageDays >= ' + ageDays + ")";
        }

        /*
        if(source ){
            if(cql){
                cql += ' AND ';
            }
            cql += '(source >= '+source+")";
        }
        */

        Coverage_CQL_Filter += "'" + cql + "'";

        fullUrl += Coverage_CQL_Filter;
    }








    dgLayer.setSource(new ol.source.WMTS({
        url: fullUrl,
        layer: 'DigitalGlobe:ImageryTileService',
        matrixSet: 'EPSG:3857',
        format: format,
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
            origin: ol.extent.getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds
        }),
        style: '',
        wrapX: true
    }));

    dgLayer.setOpacity(opacidadeDG);
    osmLayer.setOpacity(opacidadeOSM);

}

function defineMap() {

    osmLayer = new ol.layer.Tile({
        source: new ol.source.OSM(),
        opacity: opacidadeOSM
    });

    dgLayer = new ol.layer.Tile({
        opacity: opacidadeDG,
        source: null
    });

    var map = new ol.Map({
        layers: [osmLayer, dgLayer],
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


}