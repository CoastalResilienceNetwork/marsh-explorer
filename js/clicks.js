define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "selectCountry").chosen({allow_single_deselect:true, width:"252px"})
					.change(function(c){
						var val = c.target.value;
						// check for a deselect
						if (val.length == 0){
							$("#" + t.id + " .c-sel").slideUp();
							t.obj.visibleLayers = [t.countries];
							t.obj.visibleLayers1 = [-1];
						}else{
							t.layerDefs[t.selectedCountry] = "OBJECTID = " + val;
							t.layerDefs1[t.selectedCountryFill] = "OBJECTID = " + val;
							t.dynamicLayer.setLayerDefinitions(t.layerDefs);
							t.dynamicLayer1.setLayerDefinitions(t.layerDefs1);
							t.obj.visibleLayers = [t.selectedCountry, t.countries];
							t.obj.visibleLayers1 = [t.selectedCountryFill];
							$.each(t.atts,function(i,v){
								if(val == v.OBJECTID){
									var w = v.emiss_redux_1;
									if (w){
										w = w * 100;
										w = t.clicks.roundTo(w,0);
									}
									else{
										w = "N/A"
									}
									$("#" + t.id + "emiss_redux_1").html(w + "%" + v.eu)
									$("#" + t.id + "ref_yr_1").html(v.ref_yr_1)
									var x = v.emiss_cut
									if (x){
										x = t.clicks.roundTo(x,2);
										x = t.clicks.commaSeparateNumber(x);
									}else{
										x = "N/A"
									}
									$("#" + t.id + "emiss_cut").html(x)
									var y = 0;
									t.highVals = [];
									t.maxVals = [];
									t.lblArray = [];
									$("#" + t.id + " .p-a").hide();
									$.each(t.highArray,function(i1,v1){
										if(v[v1] != -99){
											t.highVals.push(v[v1]);
											y = y + Number(v[v1]);
										}else{
											t.highVals.push(0);
										}
									})
									$.each(t.maxArray,function(i1,v1){
										t.lblArray.push(v[v1]);
										if(v[v1] != -99){
											if (v[v1] > 40){
												$("#" + t.id + " .p-a:eq(" + i1 +")").show();
											}
											t.maxVals.push(v[v1]);
										}else{
											t.maxVals.push(0);
										}
									})
									t.twoDeg = 0;
									$.each(t.degArray,function(i1,v1){
										if(v[v1] != -99){
											t.twoDeg = t.twoDeg + v[v1];
										}
									})	
									if (v.emiss_cut == -99){
										t.parisBar = 0;	
									}else{
										t.parisBar = v.emiss_cut;
									}
									t.chartjs.updateChart(t);
									y = t.clicks.roundTo(y, 4)
									y = t.clicks.commaSeparateNumber(y)
									$("#" + t.id + "nscMitPoten").html(y);
								}
							})
							$("#" + t.id + " .c-sel").slideDown();
							if (t.querySource == "menu"){
								var c = $("#" + t.id + "selectCountry option:selected").text();
								var q = new Query();
								var qt = new QueryTask(t.url + "/" + t.countriesPoint);
								q.where = "country ='" + c + "'";
								q.returnGeometry = true;
								qt.execute(q, function(e){
									t.map.centerAndZoom(e.features[0].geometry,4)
								});	
							}	
							t.querySource = "menu";
						}
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers)
						t.dynamicLayer1.setVisibleLayers(t.obj.visibleLayers1)
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
