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

// layers do mapa: OSM (OpenStreetmap) e DG (Digital Globe)
var osmLayer;
var dgLayer;

// opacity
var opacidadeOSM = 1; // OSM
var opacidadeDG = 1; // Digital Globe

// default values for the Digital Globe layer
var baseUrl = 'https://services.digitalglobe.com/earthservice/wmtsaccess?';
var connectid = 'CONNECT_ID';
var featureProfile = 'Accuracy_Profile';
var mapUrl = baseUrl + 'connectid=' + connectid + '&' + 'featureProfile=' + featureProfile;
var format = 'image/jpeg';
var CQL_Filter;

// variables used for filters (CQL_Filter)
var productType;
var cloudCover;
var ageDays;

// variables used for authentication (GetCapabilities)
var username;
var password;

/** 
 * apply filter values 
 */
function configFilter() {

    productType = $('#productType').val();
    cloudCover = $('#cloudCover').val();
    ageDays = $('#ageDays').val();
}

/**
 * clean filter values 
 */
function clearConfigFilter() {

    productType = '';
    cloudCover = '';
    ageDays = '';
}


/**
 * call the GetCapabilities service for authentication
 */
function callGetCapabilities() {

    connectid = $('#connectid').val();
    username = $('#username').val();
    password = $('#password').val();

    if (!connectid) {
        alert('ConnectID não informado!')
    } else if (!username || !password) {
        alert('Usuário e/ou senha não informados!')
    } else {

        var gcURL = 'https://services.digitalglobe.com/earthservice/wmtsaccess?';
        gcURL += 'connectid=' + connectid + '&SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0&username=' +
            username + '&password=' + password;

        //fetch(gcURL);

        fetch(gcURL, {
                method: 'get'
            })
            .then(function(response) {
                console.log(response);
            })
            .catch(function(err) {
                console.error(err);
            });
    }
}


/**
 * apply filters and configurations and render the map
 */
function applyFilter() {

    format = $('#format').val();
    connectid = $('#connectid').val();
    featureProfile = $('#featureProfile').val();

    opacidadeOSM = $('#opacidadeOSM').val();
    opacidadeDG = $('#opacidadeDG').val();

    mapUrl = baseUrl + 'connectid=' + connectid + '&' + 'featureProfile=' + featureProfile;


    if (productType || cloudCover || ageDays) {

        CQL_Filter = '&CQL_Filter=';
        var cql = '';
        if (productType) {
            cql += "(productType='" + productType + "')";
        }
        if (cloudCover) {
            if (cql) {
                cql += ' AND ';
            }
            cql += "(cloudCover<'" + cloudCover + "')";
        }
        if (ageDays) {
            if (cql) {
                cql += ' AND ';
            }
            cql += "(age_days<'" + ageDays + "')";
        }

        // tests
        //cql += " AND (source='WV01')";
        //cql += " AND (offNadirAngle='0.0')";
        //cql += " AND (sunElevation='0.0')";
        //cql += " AND (sunAzimuth='0.0')";
        //cql += " AND (sourceUnit='Mosaic Product')"; // Mosaic Product
        //cql += " AND (featureId=7b1177f7200deda446c333a9a6689ba8)";
        //cql += " AND (CE90Accuracy=8.4)";
        //cql += " AND (spatialAccuracy='1:12,000')";
        //cql += " AND (crsFromPixels='EPSG:32721')";
        //cql += " AND (perPixelX='0.5')";
        //cql += " AND (perPixelY='-0.5')";
        //cql += " AND (outputMosaic=True)";


        CQL_Filter += cql;
        mapUrl += CQL_Filter;
    }

    // redefine the layer's source based on the new configurations and filters
    dgLayer.setSource(new ol.source.WMTS({
        url: mapUrl,
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


/** 
 * initial map layers definition 
 */
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