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
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url);
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", function () { 			
					t.layersArray = t.dynamicLayer.layerInfos;
					if (t.obj.stateSet == "no"){
						t.map.setZoom(2);
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
				q.where = "OBJECTID > 0";
				q.returnGeometry = false;
				q.outFields = ["*"];
				var c = [];
				qt.execute(q, function(e){
					$.each(e.features, function(i,v){
						t.atts.push(v.attributes)
						c.push(v.attributes.Group_)
					})
					var allCounties = c.sort();
					var counties = [];
					$.each(allCounties, function(i, el){
					    if($.inArray(el, counties) === -1){
					    	counties.push(el);	
					    } 
					});
					$.each(counties,function(i,v){
						var a = v.split(",")[1];
						var b = v.split(",")[0];
						$('#' + t.id + 'selectCounty').append("<option value='" + a + "'>"+ b +"</option")
					})	
					$('#' + t.id + 'selectCounty').trigger("chosen:updated");			
				});
				// handle map clicks
				// t.map.setMapCursor("pointer")
				// t.map.on('click',function(c){
				// 	if (t.open == "yes"){
				// 		t.querySource = "map";
				// 		var pnt = c.mapPoint;
				// 		var q1 = new Query();
				// 		var qt1 = new QueryTask(t.url + "/" + t.countries);
				// 		q1.geometry = pnt;
				// 		q1.outFields = ["OBJECTID"];
				// 		qt1.execute(q1, function(e){
				// 			if (e.features.length > 0){
				// 				var obid = e.features[0].attributes.OBJECTID;
				// 				$("#" + t.id + "selectCounty").val(obid).trigger("chosen:updated").trigger("change");						
				// 			}else{
				// 				t.obj.visibleLayers = [t.countries];
				// 				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 				$("#" + t.id + "selectCounty").val("").trigger("chosen:updated").trigger("change");	
				// 			}	
				// 		})	
				// 	}
				// })
			}				
		});
    }
);