var tonerUrl = 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
    tonerAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + 'Map data {attribution.OpenStreetMap}',
    toner = new L.TileLayer(tonerUrl, {
        maxZoom: 15,
        attribution: tonerAttribution
    });

var map = new L.Map('map', {
    center: new L.LatLng(41.87395806, -87.62773949, 12),
    zoom: 12,
    layers: [toner]
});

var jsonPath = "json/divvy_trips_sample.json";

var geojson = {};

var vector = L.geoJson().addTo(map);
// example of adding data to vector later:
// vector.addData(geojsonFeature);

/* Initialize the SVG layer */
map._initPathRoot();
var circsize = 1;
var stations = {};
/* We simply pick up the SVG from the map object */
var svg = d3.select("#map").select("svg"),
    //pathsvg = d3.select(map.getPanes().overlayPane).append("svg"),
    //pathg = svg.append("g").attr("class", "leaflet-zoom-hide"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
    g2 = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("json/divvy_stations_2013.json", function(collection) {
    /* Add a LatLng object to each item in the dataset */
    collection.features.forEach(function(d) {
        d.LatLng = new L.LatLng(d.latitude, d.longitude);

        // store station id with lat & long
        stations[d.id] = d.LatLng;
    });

    var feature = g.selectAll("circle")
        .data(collection.features)
        .enter()
        .append("circle")
        .attr("r", function(d) {
            return circsize;
        })
        .attr('fill', 'coral')
        .attr("id", function(d) {
            return "s_" + d.id;
        });

    function update() {
        feature.attr("cx", function(d) {
            return map.latLngToLayerPoint(d.LatLng).x
        })
        feature.attr("cy", function(d) {
            return map.latLngToLayerPoint(d.LatLng).y
        })
        feature.attr("r", function(d) {
            return circsize / 1400 * Math.pow(2, map.getZoom())
        })
    }
    map.on("viewreset", update);
    update();
    createFeatureTwo();
});

var createFeatureTwo = function() {
    d3.json("json/divvy_stations_2013.json", function(collection) {
        /* Add a LatLng object to each item in the dataset */
        collection.features.forEach(function(d) {
            d.LatLng = new L.LatLng(d.latitude, d.longitude);

            // store station id with lat & long
            stations[d.id] = d.LatLng;
        });
        
        var feature = g2.selectAll("circle")
            .data(collection.features)
            .enter()
            .append("circle")
            .attr("r", function(d) {
                return circsize*2;
            })
            .attr('fill', 'coral')
            .attr('opacity', 1);

        // var enter = feature.enter().append("circle");
        //     enter
        //         .attr("r", function(d) {
        //             return circsize * 10;
        //         })
        //         .attr('fill', 'blue');
        // feature.testFunc = function()
        // {
        //     feature
        //         .transition()            
        //         .delay(3000)            
        //         .duration(0)
        //         .attr("r", circsize * 100)
        //         .each("end", animateSecondStep);
        // }
        
        feature.on("mouseover", function(d) {
            //console.warn(d3.select(this));
            
            // grab the circle with the matching ID
            var target = d3.select("#s_" + d.id)
                .transition()
                .delay(0)
                .duration(0)
                .each("start", function() {  
                    incomingStart();
                })
                .each("end", function(d) {
                    incoming();
                });

                var incomingStart = function() {
                    target
                        .attr("stroke", "green")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function(d) {
                            return getCircSize()*10;
                        });
                };

                var incoming = function() {
                    target
                        .transition()
                        .duration(1000)
                        .attr("stroke", "coral")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", function(d) {
                            return getCircSize();
                        });
                };

                var outgoingStart = function() {
                    target
                        .attr("stroke", "coral")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", function(d) {
                            return getCircSize();
                        });
                };

                var outgoing = function() {
                    target
                        .transition()
                        .duration(1000)
                        .attr("stroke", "green")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function(d) {
                            return getCircSize()*10;
                        });
                };

                var getCircSize = function() {
                    return circsize / 1400 * Math.pow(2, map.getZoom());
                };
        });

        function update() {
            feature.attr("cx", function(d) {
                return map.latLngToLayerPoint(d.LatLng).x
            })
            feature.attr("cy", function(d) {
                return map.latLngToLayerPoint(d.LatLng).y
            })
            feature.attr("r", function(d) {
                return circsize / 1400 * Math.pow(2, map.getZoom())
            })
        }
        map.on("viewreset", update);
        update();
    });
}

d3.json(jsonPath, function(collection) {
    /* Add a LatLng object and unique id to each item in the dataset */
    //collection.features.forEach(function(d) {
    $.each(collection.features, function(idx, d) {    
        // associate station id of trip with lat long from stations
        d.start_point = new L.LatLng( stations[d.from_station_id].lat, stations[d.from_station_id].lng );
        d.end_point = new L.LatLng( stations[d.to_station_id].lat, stations[d.to_station_id].lng );
        d.unique_id = idx;
        //console.log(d.start_point + " --> " + d.end_point);
    });

    convertToGeojson(collection.features);
});

function convertToGeojson(data) {
    geojson = {
        'type' : 'FeatureCollection',
        'features' : [
            {
                'type' : 'Feature',
                'geometry' : {
                    'type' : 'MultiLineString',
                    'coordinates' : []
                },
                'properties': {
                  'unique_ids': []
          }
            }
        ]
    };

    $.each(data, function(idx, location) {
        //console.log(location.start_point.lng);
        var strtLatLng = [location.start_point.lng, location.start_point.lat];
        var endLatLng = [location.end_point.lng, location.end_point.lat];
        var latLng = [strtLatLng, endLatLng];
        var uniqueID = location.unique_id;
        geojson.features[0].geometry.coordinates.push(latLng);
        geojson.features[0].properties.unique_ids.push(uniqueID);
    });
    
    // var myStyle = {
    //     "color": "#ff7800",
    //     "weight": 1,
    //     "opacity": 0.65,
    //     "z-index": 9999
    // };

    // add lines in a leaflet layer
    //L.geoJson(geojson).addTo(map);
    L.geoJson(geojson, {
        onEachFeature: onEachFeature
    }).addTo(map);
    //vector.addData(geojsonFeature);
    // L.geoJson(geojson, {
    //     style: myStyle
    // }).addTo(map);
    //console.log(geojson);
    drawpaths(geojson);
}

function onEachFeature(feature, layer) {
    // add unique id to each feature
    //console.log(layer);
    //console.log(feature);
}

function drawpaths(collection) {

    var feature = d3.selectAll('path');
    console.log(feature);

    $.each(feature[0], function(idx, d) {
        var theId = idx;
        var start_latlng = new L.LatLng( collection.features[0].geometry.coordinates[idx][0][1], collection.features[0].geometry.coordinates[idx][0][0] );
        var end_latlng = new L.LatLng( collection.features[0].geometry.coordinates[idx][1][1], collection.features[0].geometry.coordinates[idx][1][0] );
        //console.log(end_latlng);
        var totalDistance = L.GeometryUtil.length([start_latlng, end_latlng]);
        //console.log(totalDistance);

        //feature
        d3.select(this)
            .attr("id", function() {
                return "path_" + theId;
            })
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2")
            .attr("fill", "none")
            .attr("stroke-dasharray", totalDistance + " " + totalDistance)
            .attr("stroke-dashoffset", totalDistance)
            // .transition()
            // .delay(5000)
            // .duration(100000)
            // // .ease("linear")
            // .attr("stroke-dashoffset", 0)
            // .attr("style", function () {
            //     return "stroke-dashoffset 2s ease-in-out; pointer-events:none;";
            // });
    });
    
    var testNum = Math.floor(Math.random() * 230);
    var start_latlng = new L.LatLng( collection.features[0].geometry.coordinates[testNum][0][1], collection.features[0].geometry.coordinates[testNum][0][0] );
    var end_latlng = new L.LatLng( collection.features[0].geometry.coordinates[testNum][1][1], collection.features[0].geometry.coordinates[testNum][1][0] );
    //console.log(end_latlng);
    var totalDistance = L.GeometryUtil.length([start_latlng, end_latlng]);

    var tester = d3.select("#path_" + testNum);
        tester
        .attr("stroke", "steelblue")
        .attr("stroke-width", "2")
        .attr("fill", "none")
        .attr("stroke-dasharray", totalDistance + " " + totalDistance)
        .attr("stroke-dashoffset", totalDistance)
        .transition()
        .delay(1000)
        .duration(10000)
        //.ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("style", function () {
            return "stroke-dashoffset 5s ease-in-out; pointer-events:none;";
        });


    // Use Leaflet to implement a D3 geometric transformation.
    // function projectPoint(x, y) {
    //     var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    //     this.stream.point(point.x, point.y);
    // }
}