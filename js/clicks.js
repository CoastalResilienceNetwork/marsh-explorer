define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphicsUtils"
],
function ( declare, Query, QueryTask, graphicsUtils ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				t.county = "";
				$("#" + t.id + "selectCounty").chosen({allow_single_deselect:false, width:"300px"})
					.change(function(c){
						t.county = c.target.value;
						var lyr = t.clicks.findLayer(t);
						if (lyr.length > 0){
							// query for extent
							var q = new Query();
							var qt = new QueryTask(t.url + "/" + t.lyrs.bounds );
							q.where = t.layerDefs[t.lyrs[lyr]];
							q.returnGeometry = true;
							qt.execute(q, function(e){
								var extent = graphicsUtils.graphicsExtent(e.features)
								t.map.setExtent(extent);
							})
						}	
						// show next div
						$("#" + t.id + "view-results-wrap").slideDown();
					});
				// view results checkbox clicks
				$(".vr-cb-flex input").click(function(c){
					t.obj[c.currentTarget.value] = c.currentTarget.checked;
					t.clicks.findLayer(t);
				})
				 	
			},
			findLayer: function(t){
				// find requested lyr
				var lyr = ""
				$.each(t.types, function(i,v){
					if(t.obj[v]){
						if (lyr.length == 0){
							lyr = v;
						}else{
							lyr = lyr + "_" + v;
						}
					}
				})
				if (lyr.length > 0){
					// set layer definitions
					if (t.county == 0){
						t.layerDefs[t.lyrs[lyr]] = "OBJECTID > -1";	
					}else{
						t.layerDefs[t.lyrs[lyr]] = "Group_ = '" + t.county + "'";
					}
					t.dynamicLayer.setLayerDefinitions(t.layerDefs);
					//set layer vis
					t.obj.visibleLayers = [t.lyrs[lyr]];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}else{
					t.obj.visibleLayers = [-1];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				return lyr;
			},
			makeVariables: function(t){
				t.layerDefs = [];
				t.atts = [];
				t.lyrs = {
					bounds:0, DL_DT_ER_UV:1, DL:2, DT:3, ER:4, UV:5, DL_DT:6, DL_ER:7, DL_UV:8, DT_ER:9, DT_UV:10, 
					ER_UV:11, DL_DT_ER:12, DL_ER_UV:13, DT_ER_UV:14, DL_DT_UV:15 	
				}
				t.types = ["DL","DT","ER","UV"]
			},
			commaSeparateNumber: function(val){
				while (/(\d+)(\d{3})/.test(val.toString())){
					val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
				}
				return val;
			},
			roundTo: function(n, digits) {
				if (digits === undefined) {
			    	digits = 0;
			    }
			    var multiplicator = Math.pow(10, digits);
				n = parseFloat((n * multiplicator).toFixed(11));
				var test =(Math.round(n) / multiplicator);
				return +(test.toFixed(2));
			},
			abbreviateNumber: function(num) {
			    if (num >= 1000000000) {
			        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
			     }
			     if (num >= 1000000) {
			        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
			     }
			     if (num >= 1000) {
			        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
			     }
			     return num;
			}
        });
    }
);
