(function() {
    var m = L.map('mapID').setView([41, -87], 15);
    var baseMaps = ["Stamen.Toner"
        //"OpenStreetMap.BlackAndWhite",
        //"Thunderforest.OpenCycleMap"
        //"OpenStreetMap.DE",
        //"Esri.WorldImagery",
        //"MapQuestOpen.OSM"
    ];
    var lc = L.control.layers.provided(baseMaps, {}, {
        collapsed: false
    }).addTo(m);
    m.addHash({
        lc: lc
    });
    var data = {}, 
    	layers = {}, 
    	fills = ["rgb(197,27,125)", "rgb(222,119,174)", "rgb(213, 62, 79)", "rgb(84, 39, 136)", "rgb(247,64,247)", "rgb(244, 109, 67)", "rgb(184,225,134)", "rgb(127,188,65)", "rgb(69, 117, 180)"];
    
    /* Initialize the SVG layer */
	m._initPathRoot()    
 
	/* We simply pick up the SVG from the map object */
	var svg = d3.select("#map").select("svg"),
		g = svg.append("g");

    d3.json("json/divvy_stations_2013.json", function(collection) {
        // data.json = collection.stations.map(function(v) {
        //     return [v.latitude, v.longitude];
        // });
        // points();
        // console.log(d3.geo.transform);
        //veronoi();
        //delaunay();
        //clusters();
        //quadtree();
        //window.setTimeout( function(){ animate_dot(data.json) }, 3000);
        
        /* Add a LatLng object to each item in the dataset */
        collection.stations.forEach(function(d) {
            d.LatLng = new L.LatLng(d.latitude, d.longitude);
        });
        
        var feature = g.selectAll("stations")
	        .data(collection.stations)
	        .enter()
	        .append("stations")
	        .style("stroke", "black")
	        .style("opacity", .6)
	        .style("fill", "red")
	        .attr("r", 20);
        
        m.on("viewreset", update);
        update();

        function update() {
            feature.attr("transform", function(d) {
                return "translate(" + m.latLngToLayerPoint(d.LatLng).x + "," + m.latLngToLayerPoint(d.LatLng).y + ")";
            });
        }
    });

    function animate_dot(data) {
        //console.log(data);
    }

    function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    function points() {
        layers.points = L.layerGroup(data.json.map(function(v) {
            return L.circleMarker(L.latLng(v), {
                radius: 5,
                stroke: false,
                fillOpacity: 1,
                clickable: false,
                anim: function() {
                    this.transition().attr("x", 320).duration(1000);
                },
                color: fills[Math.floor((Math.random() * 9))]
            })
        }));
        //console.log(layers.points);
        lc.addOverlay(layers.points, "points");
        // console.log(layers.points);
    }

    function veronoi() {
        data.veronoi = d3.geom.voronoi(data.json);
        layers.veronoi = L.layerGroup(data.veronoi.map(function(v) {
            return L.polygon(v, {
                stroke: false,
                fillOpacity: 0.7,
                color: fills[Math.floor((Math.random() * 9))]
            })
        }));
        lc.addOverlay(layers.veronoi, "veronoi");
    }

    function delaunay() {
        data.delaunay = d3.geom.delaunay(data.json);
        layers.delaunay = L.layerGroup(data.delaunay.map(function(v) {
            return L.polygon(v, {
                stroke: false,
                fillOpacity: 0.7,
                color: fills[Math.floor((Math.random() * 9))]
            })
        }));
        lc.addOverlay(layers.delaunay, "delaunay");
    }

    function clusters() {
        layers.clusters = new L.MarkerClusterGroup();
        layers.clusters.addLayers(data.json.map(function(v) {
            return L.marker(L.latLng(v));
        }));
        lc.addOverlay(layers.clusters, "clusters");
    }

    function quadtree() {
        data.quadtree = d3.geom.quadtree(data.json.map(function(v) {
            return {
                x: v[0],
                y: v[1]
            };
        }));
        layers.quadtree = L.layerGroup();
        data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2) {
            layers.quadtree.addLayer(L.rectangle([
                [lat1, lng1],
                [lat2, lng2]
            ], {
                fillOpacity: 0,
                weight: 1,
                color: "#000",
                clickable: false
            }));
        });
        lc.addOverlay(layers.quadtree, "quadtree");
    }
    // layers.svg=L.d3("json/ma.topo.json",{
    // 	topojson:"TOWNS",
    // 	svgClass : "Spectral",
    // 	pathClass:function(d) {
    // 		return "town q" + (10-layers.svg.quintile(d.properties.pop/layers.svg.path.area(d)))+"-11";
    // 	},
    // 	before: function(data){
    // 		var _this = this;
    // 		this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){return d.properties.pop/_this.path.area(d);})).range(d3.range(11));
    // 	}
    // });
    // layers.svg.bindPopup(function(p){
    // 	var out =[];
    // 	for(var key in p){
    // 	if(key !== "FOURCOLOR"){
    // 		out.push("<strong>"+key+"</strong>: "+p[key]);
    // 		}
    // 	}
    // 	return out.join("<br/>");
    // 	});
    // lc.addOverlay(layers.svg,"Population density");
    window.public = {};
    window.public.data = data;
    window.public.layers = layers;
}());