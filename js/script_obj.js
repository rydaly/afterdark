/*
    TODO ::

    * create up-front splash page that will initialize the app based on a date selected from a calendar
    * create a scrubbable timeline that corresponds to clock? This will be considerably difficult
    * stop clock after 24 hours and give option to reset or select another day.
    * fix zooming - currently broken
*/

'use strict';

/* globals */
var L, d3;

var D3LMap = {
    // vars for leaflet map
    map: undefined,
    toner: undefined,
    tonerUrl: 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
    tonerAttribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + 'Map data {attribution.OpenStreetMap}',
    vector: undefined,

    // vars for data
    divvy_trips_json: "json/divvy_trips_sample.json",
    geojson: {},
    stations: {},

    // vars for d3 and drawing
    svg: undefined,
    g1: undefined,
    g2: undefined,
    g3: undefined,
    circsize: 1,

    // vars for day timer and ui 
    timer: undefined,
    dayStartTime: 0,
    timerSpeed: 14.4, // ( 24000 ms total or 1440 ticks total ) 60 minutes / hour * 24 seconds = 1440 ticks total / 100;   

    initMap: function () {
        D3LMap.toner = new L.TileLayer(D3LMap.tonerUrl, {
            maxZoom: 15,
            attribution: D3LMap.tonerAttribution
        });
        D3LMap.map = new L.Map('map', {
            center: new L.LatLng(41.87395806, -87.62773949, 12),
            zoom: 13,
            layers: [D3LMap.toner]
        });

        /* Initialize the SVG layer */
        D3LMap.map._initPathRoot();

        D3LMap.vector = L.geoJson().addTo(D3LMap.map);

        /* pick up the SVG from the map object */
        D3LMap.svg = d3.select("#map").select("svg");
        
        /* append three groups to hold two sets of station markers */
        D3LMap.g1 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide");
        D3LMap.g2 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide");
        D3LMap.g3 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide");

        /* geojson structure */
        D3LMap.geojson = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': []
                },
                'properties': {
                    'unique_ids': [],
                    'start_times': [],
                    'trip_durations': [],
                    'targ_circ_start': [],
                    'targ_circ_end': [],
                    'start_delays': []
                }
            }]
        };

        D3LMap.drawMarkers();

        D3LMap.divvyTimer.init(D3LMap.dayStartTime, D3LMap.timerSpeed);
        D3LMap.initTripPaths();

        this.startAnimation = function () {
            // add lines to leaflet layer
            L.geoJson(D3LMap.geojson).addTo(D3LMap.map);
            // draw the paths and start the timer
            D3LMap.drawTripPaths(D3LMap.geojson);
            D3LMap.divvyTimer.start();
        };

        // replace this with a callback later... will load when user selects day
        setTimeout(this.startAnimation, 2500);
    },
    
    drawMarkers: function() {
        var circs_layer1 = new MarkerObj(D3LMap.g1, "pulse_circs_"),
            circs_layer2 = new MarkerObj(D3LMap.g2, "outer_circs_"),
            circs_layer3 = new MarkerObj(D3LMap.g3, "inner_circs_");

            circs_layer1.init();
            circs_layer2.init();
            circs_layer3.init();
    },

    initTripPaths: function () {
        d3.json(D3LMap.divvy_trips_json, function (collection) {
            /* Add a LatLng object and unique id to each item in the dataset */
            collection.features.forEach(function (d, idx) {

                /* associate station id of trip with lat long of start and end stations */
                d.start_point = new L.LatLng(D3LMap.stations[d.from_station_id].lat, D3LMap.stations[d.from_station_id].lng);
                d.end_point = new L.LatLng(D3LMap.stations[d.to_station_id].lat, D3LMap.stations[d.to_station_id].lng);
                d.unique_id = idx;
                d.targ_circ_start = d3.select("#inner_circs_" + d.from_station_id);
                d.targ_circ_end = d3.select("#outer_circs_" + d.to_station_id);
            });

            convertToGeojson(collection.features);
        });

        function convertToGeojson(data) {
            data.forEach(function(d, idx) {
                var strtLatLng = [data[idx].start_point.lng, data[idx].start_point.lat],
                    endLatLng = [data[idx].end_point.lng, data[idx].end_point.lat],
                    targStart = data[idx].targ_circ_start,
                    targEnd = data[idx].targ_circ_end,
                    latLng = [strtLatLng, endLatLng],
                    uniqueID = data[idx].unique_id,
                    tripduration = data[idx].tripduration,
                    startTime = data[idx].starttime.split(" ").pop(), // pop just the time off the end
                    startDelay = D3LMap.calcTimeDiff(startTime, D3LMap.dayStartTime.toString() + ":00") * 1000;

                // push data into geo json object
                D3LMap.geojson.features[0].geometry.coordinates.push(latLng);
                D3LMap.geojson.features[0].properties.unique_ids.push(uniqueID);
                D3LMap.geojson.features[0].properties.trip_durations.push(tripduration);
                D3LMap.geojson.features[0].properties.targ_circ_start.push(targStart);
                D3LMap.geojson.features[0].properties.targ_circ_end.push(targEnd);
                D3LMap.geojson.features[0].properties.start_times.push(startTime);
                D3LMap.geojson.features[0].properties.start_delays.push(startDelay);
            });
        }
    },

    drawTripPaths: function (data) {
        var feature = d3.selectAll('path');

        feature.each(function (d, idx) {
            var theId = idx,
                start_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][0][1], data.features[0].geometry.coordinates[idx][0][0]),
                end_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][1][1], data.features[0].geometry.coordinates[idx][1][0]),
                start_circ = data.features[0].properties.targ_circ_start[idx],
                end_circ = data.features[0].properties.targ_circ_end[idx],
                totalDistance = L.GeometryUtil.length([start_latlng, end_latlng]),
                actualDuration = data.features[0].properties.trip_durations[idx],
                // startTime = data.features[0].properties.start_times[idx],
                actualDelay = data.features[0].properties.start_delays[idx];

            d3.select(this)
                .attr("id", function () {
                    return "path_" + theId;
                })
                .attr("stroke", "steelblue")
                .attr("stroke-width", "2")
                .attr("fill", "none")
                .attr("stroke-dasharray", totalDistance + " " + totalDistance)
                .attr("stroke-dashoffset", totalDistance)
                .transition()
                .delay(actualDelay)
                .duration(actualDuration)
                .ease("lienar")
                .attr("stroke-dashoffset", 0)
                .attr("style", function () {
                    // return "stroke-dashoffset 5s ease-in-out; pointer-events:none;";
                    return "pointer-events:none;";
                })
                .each("start", function () {
                    D3LMap.animatePulse(start_circ, "outgoing");
                    setTimeout(D3LMap.animatePulse(end_circ, "incoming"), actualDuration);
                })
                .each("end", function () {
                    // D3LMap.animatePulse(end_circ, "incoming");
                    d3.select(this)
                        .transition()
                        .delay(1000)
                        .duration(2500)
                        .ease('linear')
                        .attr('stroke', 'white')
                        .style("opacity", 0.1);
                });
        });
    },

    animatePulse: function (target, phase) {
        var node = d3.select(target.node()),
            parent_node = d3.select(target.node().parentNode);

        switch (phase) {

        case "incoming":
                    // pulse inward
                    parent_node
                        .append("circle")
                        .attr("cx", function () { return node.attr('cx'); })
                        .attr("cy", function () { return node.attr('cy'); })
                        .attr("stroke", "green")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function () { return D3LMap.getCircSize() * 10; })
                        .transition()
                        .duration(750)
                        .delay(0)
                        .attr("stroke", "steelblue")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", function () { return 0; })
                        .each("end", function () { return this.remove(); });

                    // modify the inner circle
                    target
                        .attr('opacity', 1)
                        .transition()
                        .duration(250)
                        .delay(0)
                        .attr("fill", "YellowGreen")
                        // .attr('stroke-width', function () { return parseInt(target.attr('stroke-width')) + 1 })
                        // .attr('stroke', 'steelblue')
                        .attr('r', function () { return parseInt(target.attr('r')) + 2; })

                break;

            case "outgoing":
                    // pulse outward
                    parent_node
                        .append("circle")
                        .attr("cx", function () { return node.attr('cx'); })
                        .attr("cy", function () { return node.attr('cy'); })
                        .attr("stroke", "Tomato")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", 0)
                        .transition()
                        .duration(750)
                        .delay(0)
                        .attr("stroke", "steelblue")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function () { return D3LMap.getCircSize() * 10; })
                        .each("end", function () { return this.remove(); });

                    // modify the outer circle
                    target
                        .attr('opacity', 0.5)
                        .transition()
                        .duration(250)
                        .delay(0)
                        .attr('fill', 'red')
                        // .attr('stroke-width', function () { 
                        //     var sw = parseInt(target.style('stroke-width'));
                        //         sw += 4;
                        //         console.log(sw);
                        //     return sw; 
                        // })
                        .attr('r', function () { return parseInt(target.attr('r')) + 2; })
                        // .each("end", function(){ console.log( parseInt(target.style('stroke-width')) + 4 ); });
                break;
        }
    },

    getCircSize: function () {
        return D3LMap.circsize / 1400 * Math.pow(2, D3LMap.map.getZoom());
    },

    calcTimeDiff: function (star, en) {
        var start = star,
            end = en,
            hours = end.split(':')[0] - start.split(':')[0],
            minutes = end.split(':')[1] - start.split(':')[1],
            minFraction = 0,
            conversion = 0;

        if (minutes < 0) {
            hours--;
            minutes = 60 + minutes;
        }

        minFraction = minutes / 60;
        conversion = hours + minFraction;

        if (conversion < 0) {
            // if negative, make positive
            conversion = Math.abs(conversion);
        } else {
            // offset numbers based on dayStartTime if positive
            conversion = 24 - conversion;
        }

        // console.log(conversion);
        return conversion;
    },

    divvyTimer: {
        speed: 100,
        min: 0,
        hour: 0,
        diem: "AM",
        hourCount: 0,
        interval: undefined,
        node: document.getElementById("clockDisplay"),

        init: function (starHour, speed) {
            this.hour = starHour;
            this.speed = speed;
            this.node.innerText = "00:00";
        },

        start: function () {
            var that = this; // needs closure for proper scope

            this.interval = setCorrectingInterval(function () {
                that.run();
            }, this.speed);
        },

        stop: function () {
            // don't need for now
        },

        run: function () {
            this.min++;

            if (this.min === 60) {
                this.min = 0;
                this.hour++;
                this.hourCount++;
            }
            if (this.hour === 0) {
                // start at midnight if 0 is passed for start time
                this.hour = 12;
                this.diem = "AM";
            }
            if (this.hour === 12 && this.min === 0 && this.diem === "AM") {
                this.diem = "PM";
            } else if (this.hour === 12 && this.min === 0 && this.diem === "PM") {
                this.diem = "AM";
            }
            if (this.hour === 13) {
                this.hour = 1;
            }
            if (this.hourCount === 24) {
                clearCorrectingInterval(this.interval);
            }

            this.node.innerText = ((this.hour < 10) ? " " + this.hour : this.hour) + ":" + ((this.min < 10) ? "0" + this.min : this.min) + " " + this.diem;
        },

        getCurrentTime: function () {
            return ((this.hour < 10) ? " " + this.hour : this.hour) + ":" + ((this.min < 10) ? "0" + this.min : this.min);
        }
    }
};

function MarkerObj(group, id) {
    this.dataPath = "json/divvy_stations_2013.json";
    this.group = group;
    this.id = id;
    this.feature = undefined;
}

MarkerObj.prototype.init = function() {
    var gr = this.group,
        id = this.id,
        feat = this.feature,
        update = this.update;

    d3.json(this.dataPath, function (collection) {
        /* Add a LatLng object to each item in the dataset - only need to do this once */
        collection.features.forEach(function (d) {
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
            // store station id with lat & long
            D3LMap.stations[d.id] = d.LatLng;
        });
        feat = gr.selectAll("circle")
            .data(collection.features)
            .enter().append("circle")
            .attr('fill', 'none')
            .attr('opacity', 0)
            .attr("id", function (d) {
                return id + d.id; // assign a unique id so we can target for animation later
            });

        D3LMap.map.on("viewreset", update(feat));
        update(feat);
    });
};

MarkerObj.prototype.update = function(feat) {
    feat.attr("cx", function (d) {
        return D3LMap.map.latLngToLayerPoint(d.LatLng).x;
    });
    feat.attr("cy", function (d) {
        return D3LMap.map.latLngToLayerPoint(d.LatLng).y;
    });
    feat.attr("r", function () {
        return D3LMap.circsize / 1400 * Math.pow(2, D3LMap.map.getZoom());
    });
};

window.onload = function () {
    D3LMap.initMap();
}