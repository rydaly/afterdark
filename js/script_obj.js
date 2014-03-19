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
    * fade out trip path after the animation is complete
*/

'use strict';

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
    g: undefined,
    g2: undefined,
    circsize: 1,

    // vars for day timer and ui 
    timer: undefined,
    dayStartTime: 5,
    timerSpeed: 10,

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
                    'start_times': [],
                    'trip_durations': [],
                    'targ_circ_start': [],
                    'targ_circ_end': [],
                    'start_delays': []
                }
            }]
        };

        D3LMap.drawAnimatedMarkers();
        D3LMap.drawCountMarkers();

        D3LMap.divvyTimer.init(D3LMap.dayStartTime, D3LMap.timerSpeed);

        // replace this with a callback later... will load when user selects day
        setTimeout(startAnimation, 2500);

        function startAnimation() {
            D3LMap.initTripPaths();
            D3LMap.divvyTimer.start();
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
                actualDuration = data.features[0].properties.trip_durations[idx],
                startTime = data.features[0].properties.start_times[idx],
                actualDelay = data.features[0].properties.start_delays[idx];
            
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
                // .delay(function(d, i) { 
                //     return actualDelay;
                // })
                .delay(actualDelay)
                .duration(actualDuration)
                // .duration(function(d, i) {
                //     return duration; 
                // })
                .ease("cubic-in-out")
                .attr("stroke-dashoffset", 0)
                .attr("style", function() {
                    // return "stroke-dashoffset 5s ease-in-out; pointer-events:none;";
                    return "pointer-events:none;";
                })
                .each("start", function(d) {
                    D3LMap.animatePulse(start_circ, "outgoing");
                    // setTimeout(D3LMap.animatePulse(end_circ, "incoming"), duration);
                })
                .each("end", function(d) {
                    // console.log(startTime);
                    D3LMap.animatePulse(end_circ, "incoming");
                    d3.select(this)
                        .transition()
                        .delay(1000)
                        .duration(2500)
                        .ease('linear')
                        .attr('stroke', 'black')
                        .style("opacity", 0.0);
                });
        });
    },

    animatePulse: function(target, phase) {
        //console.log("target station ---->  " + target);
        switch(phase) {
            case "incoming" :
                    //console.log('end');
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
                    //console.log('start');
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

    calcTimeDiff: function(_start, _end) {
        // console.log(_start, _end);
        var start = _start,
            end = _end,
            hours = end.split(':')[0] - start.split(':')[0],
            minutes = end.split(':')[1] - start.split(':')[1],
            minFraction = 0,
            conversion = 0;

            // console.log(hours, minutes);
        
        // minutes = minutes.toString().length < 2 ? '0' + minutes : minutes;

        if(minutes < 0) { 
            hours--;
            minutes = 60 + minutes;
        }
        
        // hours = hours.toString().length < 2 ? '0' + hours : hours;
        
        minFraction = minutes / 60;
        conversion = hours + minFraction;
        //console.log(hours + " :: " + fraction);
        //console.log(conversion);
        if(conversion < 0) {
            // if negative, make positive
            conversion = Math.abs(conversion); 
        }
        else
        {
            // offset numbers based on dayStartTime if positive
            conversion = 24 - conversion;
        }

        return conversion;
        // console.log(conversion);
    },

    divvyTimer: {
        speed: 100,
        min: 0,
        hour: 0,
        diem: "AM",
        hourCount: 0,
        interval: undefined,
        node: document.getElementById("clockDisplay"),

        init: function( _startHour, _speed ) {
            this.hour = _startHour;
            this.speed = _speed;
            this.node.innerText = "00:00";
        },

        start: function() {
            var that = this; // needs closure for proper scope
            this.interval = setInterval(function() { that.run(); }, this.speed);
        }, 

        stop: function() {
            // don't need for now
        },

        run: function() {
            this.min++;
            
            if(this.min === 60) {
                this.min = 0;
                this.hour++;
                this.hourCount++;
                // console.log(hourCount);
            }
            if(this.hour === 0) {
                // start at midnight if 0 is passed for start time
                this.hour = 12;
                this.diem = "AM";
            }
            if(this.hour === 12 && this.min === 0 && this.diem === "AM") {
                this.diem = "PM";
            }
            else if(this.hour === 12 && this.min === 0 && this.diem === "PM") {
                this.diem = "AM";
            }
            if (this.hour === 13) {
                this.hour = 1;
            }
            if(this.hourCount === 24) {
                clearInterval(this.interval);
            }
            //console.log(this);
            this.node.innerText = ((this.hour < 10) ? " " + this.hour : this.hour) + ":" + ((this.min < 10) ? "0" + this.min : this.min) + " " + this.diem;
        },

        getCurrentTime: function() {
            return ((this.hour < 10) ? " " + this.hour : this.hour) + ":" + ((this.min < 10) ? "0" + this.min : this.min);
        }
    }
}

window.onload = function() {
    D3LMap.initMap();
}