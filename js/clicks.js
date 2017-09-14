define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				t.county = "";
				$("#" + t.id + "selectCounty").chosen({allow_single_deselect:false, width:"252px"})
					.change(function(c){
						var val = c.target.value;
						// check for a deselect
						t.layerDefs[0] = "Group_ = " + val;
						t.dynamicLayer.setLayerDefinitions(t.layerDefs);
						t.obj.visibleLayers = [0];
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					});
			},

			makeVariables: function(t){
				t.querySource = "menu";
				t.selectedCountry = 0;
				t.selectedCountryFill = 1;
				t.countries = 2;
				t.countriesAfterFirstSel = 3;
				t.countriesPoint = 4;
				t.layerDefs = [];
				t.layerDefs1 = [];
				t.atts = [];
				t.highArray = ["defor_high", "wfuel_high", "mangrove_high","peat_loss_high","legumes_high","optint_high","rice_high","natfor_high","peat_res_high","refor_high"];
				t.maxArray = ["refor_max", "defor_max", "natfor_max", "peat_res_max", "peat_loss_max", "wfuel_max", "mangrove_max", "rice_max", "optint_max", "legumes_max"];
				t.degArray = ["mangrove_2deg","peat_loss_2deg","legumes_2deg","optint_2deg","rice_2deg","natfor_2deg","peat_res_2deg","refor_2deg"];
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
