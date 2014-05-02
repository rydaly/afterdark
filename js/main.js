/*
    TODO ::

    * graph at the bottom that shows traffic amounts on a linear timeline
    * line decay taking too long on some trips - I think because trips that end after midnight are being not calculated properly
    * initialize the app based on a date selected from a calendar
    * give option to reset or select another day.
    * stats - most overall traffic / busiest, most outgoing, most incoming - zoom and pan to station on click
    * color key - incoming, outgoing, overlap
*/

/* globals */
var L, d3;

var D3LMap = {
    // vars for leaflet map
    map: undefined,
    toner: undefined,
    tonerUrl: 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
    //tonerAttribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + 'Map data {attribution.OpenStreetMap}',
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
    tip: undefined,
    lineDurationMod: 10, // multiplier for duration of line drawing

    // vars for day timer and ui
    dayStartTime: 0,
    timerSpeed: 16.6, // ( 24000 ms total or 1440 ticks total ) 60 minutes / hour * 24 seconds = 1440 ticks total - 24000/1440 = 16.6;

    // colors
    darkgrey: '#31302b',
    lightgrey: '#989287',
    blue: '#5fbdba',
    yellow: '#edb03d',
    green: '#a1bf58',
    orange: '#f0672f',

    initMap: function () {
        // console.log(D3LMap.map);
        D3LMap.toner = new L.TileLayer(D3LMap.tonerUrl, {
            maxZoom: 15,
            attribution: D3LMap.tonerAttribution
        });
        D3LMap.map = new L.Map('map', {
            center: new L.LatLng(41.87395806, -87.62773949, 12),
            zoom: 13,
            layers: [D3LMap.toner]
        });

        /* for data tips */
        D3LMap.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "Station :: <span>" + d.name + "</span>";
            });

        /* Initialize the SVG layer */
        D3LMap.map._initPathRoot();

        D3LMap.vector = L.geoJson().addTo(D3LMap.map);

        /* pick up the SVG from the map object */
        D3LMap.svg = d3.select("#map").select("svg");

        /* insert a blending filter into the svg */
        // D3LMap.svg.insert("filter").attr("id", "effect").insert("feBlend").attr("mode", "multiply").attr("in1", "BackgroundImage");

        /* bind tips to SVG */
        D3LMap.svg.call(D3LMap.tip);

        /* append three groups of station markers */
        D3LMap.g1 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "g1");
        D3LMap.g2 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "g2");
        D3LMap.g3 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "g3");

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
                    'targ_circ_start_inner': [],
                    'targ_circ_start_outer': [],
                    'targ_circ_end_inner': [],
                    'targ_circ_end_outer': [],
                    'start_delays': []
                }
            }]
        };

        D3LMap.drawMarkers();

        D3LMap.divvyTimer.init(D3LMap.dayStartTime, D3LMap.timerSpeed);
        D3LMap.initTripPaths();
    },

    startAnimation: function () {
        // add lines to leaflet layer
        L.geoJson(D3LMap.geojson).addTo(D3LMap.map);
        // draw the paths and start the timer
        D3LMap.drawTripPaths(D3LMap.geojson);
        D3LMap.divvyTimer.start();
    },

    drawMarkers: function () {
        "use strict";
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
                d.targ_circ_start_inner = d3.select("#inner_circs_" + d.from_station_id);
                d.targ_circ_start_outer = d3.select("#outer_circs_" + d.from_station_id);
                d.targ_circ_end_inner = d3.select("#inner_circs_" + d.to_station_id);
                d.targ_circ_end_outer = d3.select("#outer_circs_" + d.to_station_id);
                
                D3LMap.parseDate(d.starttime, d.stoptime);
                // console.log(D3LMap.parseDate(d.starttime, d.stoptime));
            });

            convertToGeojson(collection.features);
        });

        function convertToGeojson(data) {
            data.forEach(function(d, idx) {
                var strtLatLng = [data[idx].start_point.lng, data[idx].start_point.lat],
                    endLatLng = [data[idx].end_point.lng, data[idx].end_point.lat],
                    targStartInner = data[idx].targ_circ_start_inner,
                    targStartOuter = data[idx].targ_circ_start_outer,
                    targEndInner = data[idx].targ_circ_end_inner,
                    targEndOuter = data[idx].targ_circ_end_outer,
                    latLng = [strtLatLng, endLatLng],
                    uniqueID = data[idx].unique_id,
                    tripduration = data[idx].tripduration * D3LMap.lineDurationMod,
                    startTime = data[idx].starttime.split(" ").pop(), // pop just the time off the end
                    startDelay = D3LMap.calcTimeDiff(startTime, D3LMap.dayStartTime.toString() + ":00") * 2000;

                //console.log(startTime);
                // push data into geo json object
                D3LMap.geojson.features[0].geometry.coordinates.push(latLng);
                D3LMap.geojson.features[0].properties.unique_ids.push(uniqueID);
                D3LMap.geojson.features[0].properties.trip_durations.push(tripduration);
                D3LMap.geojson.features[0].properties.targ_circ_start_inner.push(targStartInner);
                D3LMap.geojson.features[0].properties.targ_circ_start_outer.push(targStartOuter);
                D3LMap.geojson.features[0].properties.targ_circ_end_inner.push(targEndInner);
                D3LMap.geojson.features[0].properties.targ_circ_end_outer.push(targEndOuter);
                D3LMap.geojson.features[0].properties.start_times.push(startTime);
                D3LMap.geojson.features[0].properties.start_delays.push(startDelay);
            });
        }
    },

    parseDate: function (start, end) {
        var startform = start.split(' ')[0].replace(/-/g, '/'),
            endform = end.split(' ')[0].replace(/-/g, '/'),
            dStart = new Date(startform),
            dEnd = new Date(endform),
            dObj = [ dStart, dEnd ];
            return dObj;
    },

    drawTripPaths: function (data) {
        var feature = d3.selectAll('path');

        feature.each(function (d, idx) {
            var theId = idx,
                start_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][0][1], data.features[0].geometry.coordinates[idx][0][0]),
                end_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][1][1], data.features[0].geometry.coordinates[idx][1][0]),
                start_circ_inner = data.features[0].properties.targ_circ_start_inner[idx],
                start_circ_outer = data.features[0].properties.targ_circ_start_outer[idx],
                end_circ_inner = data.features[0].properties.targ_circ_end_inner[idx],
                end_circ_outer = data.features[0].properties.targ_circ_end_outer[idx],
                totalDistance = L.GeometryUtil.length([start_latlng, end_latlng]),
                actualDuration = data.features[0].properties.trip_durations[idx],
                actualDelay = data.features[0].properties.start_delays[idx];

            d3.select(this)
                .attr("id", function () {
                    return "path_" + theId;
                })
                .attr("stroke", D3LMap.blue)
                .attr("stroke-width", "2")
                .attr("fill", "none")
                .attr('opacity', 0.5)
                .attr("stroke-dasharray", totalDistance + " " + totalDistance)
                .attr("stroke-dashoffset", totalDistance)
                .attr("style", function () {
                    return "pointer-events:none;";
                });
        });
    },

    animatePath: function (id) {

        // TODO :: 
        // * add duration param and feed to animation time
        // * fade out lines on complete

        var test = d3.select("#path_" +  id)
            // .transition()
            //.delay(0)
            //.duration(20000)
            //.ease('in-out')
            .attr("stroke-dashoffset", 0)
            .attr("style", function () {
                return "transition:stroke-dashoffset 1s ease-in-out; pointer-events:none;";
            });
            // .each("start", function () {
            //     console.log('start :: ' + this);
            // })
            // .each("end", function () {
            //     console.log('end :: ' + this);
            // });
            // .each("start", function () {
            //     d3.select(this)
            //         .transition()
            //         .delay(actualDuration / 5)
            //         .duration(2000)
            //         .ease('linear')
            //         .attr('stroke', 'white')
            //         .style("opacity", 0.1);
            // })
            // .each("end", function () {
            //     // d3.select(this)
            //     //     .transition()
            //     //     .delay(0)
            //     //     .duration(2000)
            //     //     .ease('linear')
            //     //     .attr('stroke', 'white')
            //     //     .style("opacity", 0.1);
            // });

            // .transition()
            // .delay(actualDelay)
            // .duration(actualDuration * 2)
            // .ease('in-out')
            // .attr("stroke-dashoffset", 0)
            // .attr("style", function () {
            //     // return "stroke-dashoffset 5s ease-in-out; pointer-events:none;";
            //     return "pointer-events:none;";
            // })
            // .each("start", function () {
            //     // D3LMap.animatePulse(start_circ_outer, start_circ_inner, "outgoing", actualDuration);
            //         // setTimeout(D3LMap.animatePulse(end_circ_outer, end_circ_inner, "incoming", actualDuration), actualDuration);
            //     // D3LMap.animatePulse(end_circ_outer, end_circ_inner, "incoming", actualDuration / 25);
            //         // console.log(actualDuration);
            //     d3.select(this)
            //         .transition()
            //         .delay(actualDuration / 5)
            //         .duration(2000)
            //         .ease('linear')
            //         .attr('stroke', 'white')
            //         .style("opacity", 0.1);
            // })
            // .each("end", function () {
            //     // d3.select(this)
            //     //     .transition()
            //     //     .delay(0)
            //     //     .duration(2000)
            //     //     .ease('linear')
            //     //     .attr('stroke', 'white')
            //     //     .style("opacity", 0.1);
            // });
    },

    // re-hash this so that if it's incoming, it incs the innerTarget, vise versa
    animatePulse: function (outerTarget, innerTarget, phase, pulse_delay) {
        var outer_node = d3.select(outerTarget.node()),
            inner_node = d3.select(innerTarget.node()),
            parent_node = d3.select(outerTarget.node().parentNode),
            cur_inner_r = inner_node.attr('r');

        switch (phase) {

        case "incoming":
                    // pulse inward
                    parent_node
                        .append("circle")
                        .attr("cx", function () { return outer_node.attr('cx'); })
                        .attr("cy", function () { return outer_node.attr('cy'); })
                        .attr("stroke", D3LMap.green)
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function () { return D3LMap.getCircSize() * 15; })
                        .transition()
                        .duration(1000)
                        .delay(pulse_delay)
                        .ease('out')
                        .attr('opacity', 0.75)
                        .attr("r", function () { return 0; })
                        .each("end", function () { return this.remove(); });

                    // modify the inner circle
                    innerTarget
                        .attr('opacity', 0.75)
                        .transition()
                        .duration(1000)
                        .delay(pulse_delay + 100)
                        .ease('out')
                        .attr("fill", D3LMap.green)
                        // .attr('stroke-width', function () { return parseInt(target.attr('stroke-width')) + 1 })
                        // .attr('stroke', 'steelblue')
                        .attr('r', function () { return parseInt(innerTarget.attr('r')) + 3; });
                break;

            case "outgoing":
                    // pulse outward
                    parent_node
                        .append("circle")
                        .attr("cx", function () { return outer_node.attr('cx'); })
                        .attr("cy", function () { return outer_node.attr('cy'); })
                        .attr("stroke", D3LMap.orange)
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 0.75)
                        .attr("r", 0)
                        .transition()
                        .duration(750)
                        .delay(0)
                        .ease('out')
                        .attr('opacity', 0)
                        .attr("r", function () { return D3LMap.getCircSize() * 10; })
                        .each("end", function () { return this.remove(); });

                    // modify the outer circle
                    outerTarget
                        .attr('opacity', 0.75)
                        .transition()
                        .duration(1000)
                        .delay(0)
                        .ease('out')
                        .attr('fill', D3LMap.orange)
                        // .attr('stroke-width', function () {
                        //     var sw = parseInt(target.style('stroke-width'));
                        //         sw += 4;
                        //         console.log(sw);
                        //     return sw;
                        // })
                        // .attr('r', function () { return parseInt(target.attr('r')) + 2; });
                        .attr('r', function () {
                            return parseInt(outerTarget.attr('r')) + 3;
                        });
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
        inc: 0,
        perc: 0,
        speed: 100,
        min: 0,
        hour: 0,
        diem: "AM",
        hourCount: 0,
        interval: undefined,
        node: document.getElementById("clockDisplay"),
        progBar: document.getElementById("progress-bar"),
        startTimeIndex: 0,

        init: function (starHour, speed) {
            this.hour = starHour;
            this.speed = speed;
            this.node.innerText = "12:00 AM";
        },

        start: function () {
            var that = this;
            this.interval = setCorrectingInterval(function () {
                that.run();
                //that.update();
                //that.draw();
            }, this.speed);
        },

        stop: function () {
            // don't need for now
        },

        update: function () {

        },

        draw: function () {

        },

        run: function () {
            this.inc++;
            this.perc = this.inc / 1440 * 100;
            this.min++;

            this.progBar.setAttribute("style","width:" + this.perc + "%");

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
            // console.log(this.node.innerText);
            // console.log(D3LMap.geojson.features[0].properties.start_times[this.inc]);
            //D3LMap.geojson.features[0].properties.start_times
            var time = this.node.innerText;
            var hours = Number(time.match(/^(\d+)/)[1]);
            var minutes = Number(time.match(/:(\d+)/)[1]);
            var AMPM = time.match(/\s(.*)$/)[1];
            if(AMPM == "PM" && hours<12) hours = hours+12;
            if(AMPM == "AM" && hours==12) hours = hours-12;
            var sHours = hours.toString();
            var sMinutes = minutes.toString();
            if(hours<10) sHours = "0" + sHours;
            if(minutes<10) sMinutes = "0" + sMinutes;
            var conv = sHours + ":" + sMinutes;
            
            var dat = D3LMap.geojson.features[0].properties;
            var thisfeature = d3.selectAll('path');

            while ( conv === D3LMap.geojson.features[0].properties.start_times[this.startTimeIndex] ) {
                D3LMap.animatePulse(dat.targ_circ_start_outer[this.startTimeIndex], dat.targ_circ_start_inner[this.startTimeIndex], "outgoing", dat.trip_durations[this.startTimeIndex]);
                D3LMap.animatePulse(dat.targ_circ_end_outer[this.startTimeIndex], dat.targ_circ_end_inner[this.startTimeIndex], "incoming", dat.trip_durations[this.startTimeIndex] / 25);
                D3LMap.animatePath(this.startTimeIndex);
                this.startTimeIndex++;
            }
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
    var group = this.group,
        id = this.id,
        feature = this.feature,
        update = this.update;

    d3.json(this.dataPath, function (collection) {
        /* Add a LatLng object to each item in the dataset - only need to do this once */
        collection.features.forEach(function (d) {
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
            // store station id with lat & long
            D3LMap.stations[d.id] = d.LatLng;
        });
        feature = group.selectAll("circle")
            .data(collection.features)
            .enter().append("circle")
            .attr('fill', 'none')
            .attr('opacity', 0)
            .attr('r', 0)
            .attr("id", function (d) {
                return id + d.id; // assign a unique id so we can target for animation later
            })
            .on('mouseover', function(d) {
                D3LMap.tip.attr('class', 'd3-tip fade-in').show(d);
            })
            .on('mouseout', function(d) {
                D3LMap.tip.attr('class', 'd3-tip fade-out').show(d);
                D3LMap.tip.hide();
            });

        var reset = function () { update(feature); };

        D3LMap.map.on("viewreset", reset);
        update(feature);
    }.bind(this));
};

MarkerObj.prototype.update = function(feat) {
    feat.attr("cx", function (d) {
        return D3LMap.map.latLngToLayerPoint(d.LatLng).x;
    });
    feat.attr("cy", function (d) {
        return D3LMap.map.latLngToLayerPoint(d.LatLng).y;
    });
    // feat.attr("r", function (d) {
    //     // console.log(parseInt(feat.attr('r')));
    //     return 4 / 1400 * Math.pow(2, D3LMap.map.getZoom());
    // });
};

function initMain () {
    if (window.location.hash === '#go') {
        // console.log(window.location.hash);
        // console.log('has hash...');
        setTimeout(D3LMap.startAnimation, 5000);
        // D3LMap.startAnimation();
    } else if (window.location.hash === '#init') {
        // console.log("no hash...");
        // console.log(window.location.hash);
        if (D3LMap.map === undefined) {
            D3LMap.initMap();
        }
    }

}
