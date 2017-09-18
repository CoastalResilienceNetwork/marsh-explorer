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
						var val = c.target.value;
						// set layer definitions
						if (val == 0){
							t.layerDefs[0] = "OBJECTID > -1";	
						}else{
							t.layerDefs[0] = "Group_ = '" + val + "'";
						}
						t.dynamicLayer.setLayerDefinitions(t.layerDefs);
						t.obj.visibleLayers = [0];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						// query for extent
						var q = new Query();
						var qt = new QueryTask(t.url + "/1" );
						q.where = t.layerDefs[0];
						q.returnGeometry = true;
						qt.execute(q, function(e){
							var extent = graphicsUtils.graphicsExtent(e.features)
							t.map.setExtent(extent);
						})
						// show next div
						$("#" + t.id + "view-results-wrap").slideDown();
					});
			},

			makeVariables: function(t){
				t.layerDefs = [];
				t.atts = [];
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
