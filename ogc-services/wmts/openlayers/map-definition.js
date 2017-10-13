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

// opacidade
var opacidadeOSM = 1; // OSM
var opacidadeDG = 1; // Digital Globe

// variáveis com valores default para as configurações da camada da Digital Globe
var baseUrl = 'https://services.digitalglobe.com/earthservice/wmtsaccess?';
var connectid = 'CONNECT_ID';
var featureProfile = 'Accuracy_Profile';
var mapUrl = baseUrl + 'connectid=' + connectid + '&' + 'featureProfile=' + featureProfile;
var format = 'image/jpeg';
var CQL_Filter;

// variáveis usadas no filtro (CQL_Filter)
var productType;
var cloudCover;
var ageDays;

// variáveis usadas na autenticação (GetCapabilities)
var username;
var password;

/** 
 * aplica valores do filtro nas variáveis 
 */
function configFilter() {

    productType = $('#productType').val();
    cloudCover = $('#cloudCover').val();
    ageDays = $('#ageDays').val();
}

/**
 * limpa valores dos filtros nas variáveis 
 */
function clearConfigFilter() {

    productType = '';
    cloudCover = '';
    ageDays = '';
}


/**
 * chama o serviço GetCapabilities do provedor para autenticação
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
 * aplica os filtros e configurações e reenderiza o mapa
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
        CQL_Filter += cql;
        mapUrl += CQL_Filter;
    }

    // redefinição do source da layer com base nas novas configurações e filtros
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
 * definição inicial das layers dos mapas 
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