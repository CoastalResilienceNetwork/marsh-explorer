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
						// query to change extent to selected county
						var q = new Query();
						var qt = new QueryTask(t.url + "/" + t.lyrs.bounds );
						q.where = "Group_ = '" + t.county + "'";
						q.returnGeometry = true;
						qt.execute(q, function(e){
							var extent = graphicsUtils.graphicsExtent(e.features)
							t.map.setExtent(extent);
							// trigger radio button click
							$(".vr-rb-wrap input[value='" + t.obj.ranking +"']").each(function(i,v){
								$(v).prop('checked', false);
								$(v).trigger("click");
							})	
						})
						// show next div
						$("#" + t.id + " .couny-selected-wrap").slideDown();
					});
				// view results radio buttons
				$("#" + t.id + " .vr-rb-wrap input").change(function(c){
					var val = c.currentTarget.value
					t.obj.ranking = val;
					// clicked on combined rankings
					if (val == "DL_DT_ER_UV"){
						// disabled checkboxes in lower sections
						$(".vr-cb-flex input").prop("disabled", true);
						// set layer definitions
						var w = "Group_ = '" + t.county + "'";
						if (t.county == "Coast of New Jersey (Entire Project)"){
							w = "OBJECTID > -1";
						}
						t.layerDefs[t.lyrs[val]] = w;
						t.dynamicLayer.setLayerDefinitions(t.layerDefs);
						//set layer vis
						t.obj.visibleLayers = [t.lyrs[val]];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}
					// clicked on select rankings
					if (c.currentTarget.value == "select-rankings"){
						// enable checkboxes
						$(".vr-cb-flex input").prop("disabled", false);
						// set checkboxes checked state
						$.each(t.types, function(i,v){
							if(t.obj[v]){
								$("#" + t.id + v).prop('checked', true);	
							}
						})
						t.clicks.showRankingsLayer(t);
					}
				})
				// selected rankings checkbox clicks
				$("#" + t.id + " .vr-cb-flex input").click(function(c){
					// update the object that tracks checkbox state
					t.obj[c.currentTarget.value] = c.currentTarget.checked;
					// update t.lyr object by looking for properties set to true
					t.lyr = "";
					$.each(t.types, function(i,v){
						if(t.obj[v]){
							if (t.lyr.length == 0){
								t.lyr = v;
							}else{
								t.lyr = t.lyr + "_" + v;
							}
						}
					})	
					t.clicks.showRankingsLayer(t);
				})
				// click on supporting data
				$("#" + t.id + " .sup-data-cb-wrap input").click(function(c){
					if (c.currentTarget.checked){
						t.obj.visibleLayers1.push(c.currentTarget.value);
						t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
					}else{
						var ind = t.obj.visibleLayers1.indexOf(c.currentTarget.value)
						if (ind > -1){
							t.obj.visibleLayers1.splice(ind, 1);
							t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1);
						}
					}
				});			 	
			},
			showRankingsLayer: function(t){
				// set layer definitions
				var w = "Group_ = '" + t.county + "'";
				if (t.county == "Coast of New Jersey (Entire Project)"){
					w = "OBJECTID > -1";
				}
				t.layerDefs[t.lyrs[t.lyr]] = w;
				t.dynamicLayer.setLayerDefinitions(t.layerDefs);
				//set layer vis
				t.obj.visibleLayers = [t.lyrs[t.lyr]];
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
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
