define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color ) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					if (t.obj.stateSet == "no"){
						
					}
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
				});		
				// get data table
				var q = new Query();
				var qt = new QueryTask(t.url + "/0" );
				q.where = "OBJECTID > -1";
				q.returnGeometry = false;
				q.outFields = ["*"];
				var c = [];
				qt.execute(q, function(e){
					$.each(e.features, function(i,v){
						c.push(v.attributes.Group_)
					})
					var allCounties = c.sort();
					var counties = [];
					$.each(allCounties, function(i, el){
					    if($.inArray(el, counties) === -1){
					    	counties.push(el);	
					    } 
					});
					$('#' + t.id + 'selectCounty').append("<option value='0'>Coast of New Jersey (Entire Project)</option")
					$.each(counties,function(i,v){
						$('#' + t.id + 'selectCounty').append("<option value='" + v + "'>"+ v +"</option")
					})	
					$('#' + t.id + 'selectCounty').trigger("chosen:updated");			
				});
				// handle map clicks
				t.map.setMapCursor("pointer")
				var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255,0,0]), 2),new Color([255,255,255,0]));
				t.map.on('click',function(c){
					t.map.setMapCursor("pointer")
					if (t.open == "yes"){
						t.map.graphics.clear();
						var pnt = c.mapPoint;
						var q1 = new Query();
						var qt1 = new QueryTask(t.url + "/0");
						q1.geometry = pnt;
						q1.outFields = ["*"];
						q1.returnGeometry = true;
						qt1.execute(q1, function(e){
							if (e.features.length > 0){
								t.atts = e.features[0].attributes;
								console.log(t.atts.Disp_Desc);
								var geo = e.features[0].geometry;
								t.map.graphics.add(new Graphic(geo,sfs))													
							}else{
								
							}	
						})	
					}
				})
			}				
		});
    }
);