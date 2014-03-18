/*
    TODO :: 

    * abstract pulse functions so they can be called whenever
        function pulse(latlng) {
    
        }
    * organize data based on start time
    * abstract line drawing so we can make calls whenever
        function drawLine(startPoint, endPoint, duration) {
    
        }
    * create up-front splash page that will initialize the app based on a date selected from a calendar
    * Switch AM / PM on clock 
    * create a scrubbable timeline that corresponds to clock
    * stations need to start with 0 radius and grow according to data
        - two rings - one to represent incoming bikes and one to represent outgoing
        - these rings dynamically update as the timeline progresses
    * stop clock after 24 hours and give option to reset or select another day. 
*/

'use strict';

var D3LMap = {
    //var createMap = function(){}; // read data and setup all aspects of map
    //var incomingPulse = function(LatLng){};
    //var outgoingPulse = function(LatLng){};
    //var animatePath = function(path){};
    // }

    // vars for leaflet map
    map: undefined,
    toner: undefined,
    tonerUrl: 'http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.jpg',
    tonerAttribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' + 'Map data {attribution.OpenStreetMap}',
    vector: undefined,

    // vars for data
    divvy_trips_json: "json/divvy_trips_sample_sm.json",
    geojson: {},
    stations: {},

    // vars for d3 and drawing
    svg: undefined,
    g: undefined,
    g2: undefined,
    circsize: 1,

    // var for ui
    timer: undefined,

    initMap: function() {
        D3LMap.toner = new L.TileLayer(D3LMap.tonerUrl, {
            maxZoom: 15,
            attribution: D3LMap.tonerAttribution
        }),
        D3LMap.map = new L.Map('map', {
            center: new L.LatLng(41.87395806, -87.62773949, 12),
            zoom: 14,
            layers: [D3LMap.toner]
        });

        /* Initialize the SVG layer */
        D3LMap.map._initPathRoot();

        D3LMap.vector = L.geoJson().addTo(D3LMap.map);
        
        /* pick up the SVG from the map object */
        D3LMap.svg = d3.select("#map").select("svg"),
        /* append two groups to hold two sets of station markers */
        D3LMap.g = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide"),
        D3LMap.g2 = D3LMap.svg.append("g").attr("class", "leaflet-zoom-hide"),

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
                    'trip_durations': [],
                    'targ_circ_start': [],
                    'targ_circ_end': []
                }
            }]
        };

        D3LMap.drawAnimatedMarkers();
        D3LMap.drawCountMarkers();

        // replace this with a callback later... will load when user selects day
        setTimeout(startAnimation, 2500);

        function startAnimation() {
            D3LMap.initTripPaths();
            D3LMap.divvyTimer(5, 10)
        }
    },
    
    drawAnimatedMarkers: function() {
        d3.json("json/divvy_stations_2013.json", function(collection) {
            /* Add a LatLng object to each item in the dataset */
            collection.features.forEach(function(d) {
                d.LatLng = new L.LatLng(d.latitude, d.longitude);
                // store station id with lat & long
                D3LMap.stations[d.id] = d.LatLng;
            });
            
            var feature = D3LMap.g.selectAll("circle")
                .data(collection.features)
                .enter().append("circle")
                .attr("r", function(d) {
                    return D3LMap.circsize;
                })
                .attr('fill', 'coral')
                .attr("id", function(d) {
                    return "s_" + d.id; // assign a unique id so we can target for animation later
                });

            function update() {
                feature.attr("cx", function(d) {
                    return D3LMap.map.latLngToLayerPoint(d.LatLng).x
                })
                feature.attr("cy", function(d) {
                    return D3LMap.map.latLngToLayerPoint(d.LatLng).y
                })
                feature.attr("r", function(d) {
                    return D3LMap.circsize / 1400 * Math.pow(2, D3LMap.map.getZoom())
                })
            }

            D3LMap.map.on("viewreset", update);
            update();
        });
    },

    drawCountMarkers: function() {
        d3.json("json/divvy_stations_2013.json", function(collection) {
            /* Add a LatLng object to each item in the dataset */
            collection.features.forEach(function(d) {
                d.LatLng = new L.LatLng(d.latitude, d.longitude);
                // store station id with lat & long
                D3LMap.stations[d.id] = d.LatLng;
            });
            var feature = D3LMap.g2.selectAll("circle")
                .data(collection.features)
                .enter()
                .append("circle")
                .attr("r", function(d) {
                    return D3LMap.circsize * 2;
                })
                .attr('fill', 'coral')
                .attr('opacity', 1);

            // feature.on("mouseover", function(d) {
            //     //console.warn(d3.select(this));
            //     // grab the circle with the matching ID
            //     var target = d3.select("#s_" + d.id)
            //         .transition()
            //         .delay(0)
            //         .duration(0)
            //         .each("start", function() {
            //             D3LMap.animatePulse(target, "outStart");
            //         })
            //         .each("end", function(d) {
            //             D3LMap.animatePulse(target, "outEnd");
            //         });
            // });

            /*

                !!! LOOK INTO CREATING AN OBJECT THAT BOTH CIRC LAYERS CAN USE
                    - IT WILL CONTAIN THE UPDATE FUNCTION TO KEEP THINGS DRY
                    var markerObj = { var feature; var update = function(){ // do update }  }

            */

            function update() {
                feature.attr("cx", function(d) {
                    return D3LMap.map.latLngToLayerPoint(d.LatLng).x
                })
                feature.attr("cy", function(d) {
                    return D3LMap.map.latLngToLayerPoint(d.LatLng).y
                })
                feature.attr("r", function(d) {
                    return D3LMap.circsize / 1400 * Math.pow(2, D3LMap.map.getZoom())
                })
            }

            D3LMap.map.on("viewreset", update);
            update();
        });
    },

    initTripPaths: function() {
        d3.json(D3LMap.divvy_trips_json, function(collection) {
            /* Add a LatLng object and unique id to each item in the dataset */
            collection.features.forEach(function(d, idx) {

                /* associate station id of trip with lat long of start and end stations */
                d.start_point = new L.LatLng(D3LMap.stations[d.from_station_id].lat, D3LMap.stations[d.from_station_id].lng);
                d.end_point = new L.LatLng(D3LMap.stations[d.to_station_id].lat, D3LMap.stations[d.to_station_id].lng);
                d.unique_id = idx;
                d.targ_circ_start = d3.select("#s_" + d.from_station_id);
                d.targ_circ_end = d3.select("#s_" + d.to_station_id);
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
                    tripduration = data[idx].tripduration;
                
                // push data into geo json object
                D3LMap.geojson.features[0].geometry.coordinates.push(latLng);
                D3LMap.geojson.features[0].properties.unique_ids.push(uniqueID);
                D3LMap.geojson.features[0].properties.trip_durations.push(tripduration * 10);
                D3LMap.geojson.features[0].properties.targ_circ_start.push(targStart);
                D3LMap.geojson.features[0].properties.targ_circ_end.push(targEnd);
            });
            
            // add lines to leaflet layer
            L.geoJson(D3LMap.geojson).addTo(D3LMap.map);
            
            // draw the paths
            D3LMap.drawTripPaths(D3LMap.geojson);
        }
    },

    drawTripPaths: function(data) {
        var feature = d3.selectAll('path');
        
        feature.each(function(d, idx) {
            var theId = idx,
                start_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][0][1], data.features[0].geometry.coordinates[idx][0][0]),
                end_latlng = new L.LatLng(data.features[0].geometry.coordinates[idx][1][1], data.features[0].geometry.coordinates[idx][1][0]),
                start_circ = data.features[0].properties.targ_circ_start[idx],
                end_circ = data.features[0].properties.targ_circ_end[idx],
                totalDistance = L.GeometryUtil.length([start_latlng, end_latlng]),
                theNode = d3.select(this).node(),
                duration = data.features[0].properties.trip_durations[idx];
            
            //console.log(totalDistance);
            
            d3.select(this)
                .attr("id", function() {
                    return "path_" + theId;
                })
                .attr("stroke", "steelblue")
                .attr("stroke-width", "2")
                .attr("fill", "none")
                .attr("stroke-dasharray", totalDistance + " " + totalDistance)
                .attr("stroke-dashoffset", totalDistance)
                .transition()
                .delay(Math.random() * 5000 + 1000)
                .duration(function() {
                    return duration;
                })
                .ease("linear")
                .attr("stroke-dashoffset", 0)
                .attr("style", function() {
                    // return "stroke-dashoffset 5s ease-in-out; pointer-events:none;";
                    return "pointer-events:none;";
                })
                .each("start", function() {
                    D3LMap.animatePulse(start_circ, "outgoing");
                    setTimeout(D3LMap.animatePulse(end_circ, "incoming"), duration);
                })
                .each("end", function(d) {
                    D3LMap.animatePulse(end_circ, "incoming");
                });
        });
    },

    animatePulse: function(target, phase) {
        //console.log("target station ---->  " + target);
        switch(phase) {
            case "incoming" :
                    target
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function(d) {
                            return D3LMap.getCircSize() * 5;
                        })
                        .transition()
                        .duration(500)
                        .delay(0)
                        .attr("stroke", "green")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", function(d) {
                            return 0;
                        });
                break;

            case "outgoing" :
                    target
                        .attr("stroke", "red")
                        .attr("stroke-width", "2")
                        .attr("fill", "none")
                        .attr('opacity', 1)
                        .attr("r", function(d) {
                            // return D3LMap.getCircSize();
                            return 0;
                        })
                        .transition()
                        .duration(500)
                        .delay(0)
                        .attr("stroke", "steelblue")
                        .attr("fill", "none")
                        .attr('opacity', 0)
                        .attr("r", function(d) {
                            return D3LMap.getCircSize() * 5;
                        });
                break;
        }
    },

    getCircSize: function() {
        return D3LMap.circsize / 1400 * Math.pow(2, D3LMap.map.getZoom());
    },

    divvyTimer: function(_startHour, _speed) {
        var speed = _speed,
            min = 0,
            hour = _startHour,
            diem = "AM",
            hourCount = 0,
            interval = undefined,
            display = document.getElementById("clockDisplay"),

            run = function() {
                min++;
            
                if(min === 60) {
                    min = 0;
                    hour++;
                    hourCount++;
                    // console.log(hourCount);
                }
                if(hour === 0) {
                    // start at midnight if 0 is passed in for _startHour
                    hour = 12;
                    diem = "AM";
                }
                if(hour === 12 && min === 0 && diem === "AM") {
                    diem = "PM";
                }
                else if(hour === 12 && min === 0 && diem === "PM") {
                    diem = "AM";
                }
                if (hour === 13) {
                    hour = 1;
                }
                if(hourCount === 24) {
                    window.clearInterval(interval);
                }

                display.innerText = ((hour < 10) ? " " + hour : hour) + " : " + ((min < 10) ? "0" + min : min) + " " + diem;
            }

            interval = window.setInterval(run, speed);
        }
}

window.onload = function() {
    D3LMap.initMap();
}