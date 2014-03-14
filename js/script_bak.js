var tonerUrl = 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
    tonerAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + 'Map data {attribution.OpenStreetMap}',
    toner = new L.TileLayer(tonerUrl, {
        maxZoom: 18,
        attribution: tonerAttribution
    });

var map = new L.Map('map', {
    center: new L.LatLng(41.87395806, -87.62773949, 15),
    zoom: 11,
    layers: [toner]
});

var jsonPath = "json/divvy_trips_sample_sm.json";

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
    g = svg.append("g");

function convertToGeojson(data) {
    geojson = {
        'type' : 'FeatureCollection',
        'features' : [
            {
                'type' : 'Feature',
                'geometry' : {
                    'type' : 'MultiPoint',
                    'coordinates' : []
                }
            }
        ]
    };

    $.each(data, function(idx, location) {
        //console.log(location.start_point);
        // console.log(idx);
        var latLng = [location.start_point.lng, location.start_point.lat, location.end_point.lng, location.end_point.lat];
        geojson.features[0].geometry.coordinates.push(latLng);
    });
    
    // var myStyle = {
    //     "color": "#ff7800",
    //     "weight": 1,
    //     "opacity": 0.65
    // };
   
   // add lines in a leaflet layer
    // L.geoJson(geojson, {
    //     style: myStyle
    // }).addTo(map);
    drawpaths(geojson);
}

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
        .attr('fill', 'lightcoral');
    
    // feature.on("mouseover", function(d) {
    //     //console.warn(d3.select(this));
    //     d3.select(this).transition().delay(300).
    //     duration(1000).attr('cx', function(d) {
    //         return circsize;
    //     }).attr('fill', 'blue')
    // });

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

d3.json(jsonPath, function(collection) {
    /* Add a LatLng object to each item in the dataset */
    collection.features.forEach(function(d) {
        // associate station id of trip with lat long from stations
        d.start_point = new L.LatLng( stations[d.from_station_id].lat, stations[d.from_station_id].lng );
        d.end_point = new L.LatLng( stations[d.to_station_id].lat, stations[d.to_station_id].lng );
        //console.log(d.start_point + " --> " + d.end_point);
    });

    // var feature = g.selectAll("circle")
    //     .data(collection.features)
    //     .enter()
    //     .append("circle")
    //     .attr("r", function(d) {
    //         return circsize;
    //     })
    //     .attr('fill', 'red');
    
    //     feature.on("mouseover", function(d) {
    //         this.mouseover = null;
    //         //console.warn(d3.select(this));
    //         d3.select(this).transition().delay(300).
    //         duration(1000).attr('cx', function(d) {
    //             return circsize;
    //         }).attr('fill', 'yellow');
    //     });

    // function update() {
    //     feature.attr("cx", function(d) {
    //         return map.latLngToLayerPoint(d.start_point).x;
    //     })
    //     feature.attr("cy", function(d) {
    //         return map.latLngToLayerPoint(d.start_point).y
    //     })
    //     feature.attr("r", function(d) {
    //         return circsize*2 / 1400 * Math.pow(2, map.getZoom())
    //     })
    // }
    // map.on("viewreset", update);
    // update();

    convertToGeojson(collection.features);
    //console.log(geojson);

    //drawpaths(collection);
});

function drawpaths(collection) {

    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide line");

    var transform = d3.geo.transform({point: projectPoint});
    
    var line = d3.svg.line()
        .interpolate("cardinal")
        .x(function(d) { return map.latLngToLayerPoint(new L.LatLng(d[1], d[0])).x; })
        .y(function(d) { return map.latLngToLayerPoint(new L.LatLng(d[1], d[0])).y; });

    var path = d3.geo.path()
            .projection(transform);

    var feature = g.selectAll("path")
        .data(collection.features)
        .enter().append("path")
        .attr("stroke", "steelblue")
        .attr("stroke-width", "2")
        .attr("fill", "none");

    feature
        .attr("stroke-dasharray", 100 + " " + 100)
        .attr("stroke-dashoffset", 100)
        .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

    // var totalLength = feature.node().getTotalLength();
    // console.log(feature.node().getTotalLength());

    map.on("viewreset", reset);
    reset();

    function reset() {

        var bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg .attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px")
            .attr("class", "d3_svg");

        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", function(d) { return line(d.geometry.coordinates); });
    }

    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }
}