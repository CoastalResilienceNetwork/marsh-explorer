define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "selectCountry").chosen({allow_single_deselect:true, width:"220px"})
					.change(function(c){
						var val = c.target.value;
						// check for a deselect
						if (val.length == 0){
							$("#" + t.id + " .c-sel").slideUp();
							t.obj.visibleLayers = [t.countries];
						}else{
							t.layerDefs[t.selectedCountry] = "OBJECTID = " + val;
							t.dynamicLayer.setLayerDefinitions(t.layerDefs);
							t.obj.visibleLayers = [t.selectedCountry, t.countries];
							$.each(t.atts,function(i,v){
								if(val == v.OBJECTID){
									var x = v.tot_emiss_2013
									if (x){
										x = t.clicks.commaSeparateNumber(x)
									}else{
										x = "N/A"
									}
									$("#" + t.id + "tot_emiss_2013").html(x)
									var y = 0;
									t.pwArray = [];
									t.lblArray = [];
									$("#" + t.id + " .p-a").hide();
									$.each(t.mitPoten,function(i1,v1){
										t.lblArray.push(v[v1]);
										if(v[v1] != -99){
											if (v[v1] > 40){
												$("#" + t.id + " .p-a:eq(" + i1 +")").show();
											}
											t.pwArray.push(v[v1]);
											y = y + Number(v[v1]);
										}else{
											t.pwArray.push(0);
										}
									})	
									t.parisBar = v.ref_yr_emiss;
									t.chartjs.updateChart(t);
									y = t.clicks.roundTo(y, 4)
									y = t.clicks.commaSeparateNumber(y)
									$("#" + t.id + "nscMitPoten").html(y);
								}
							})
							$("#" + t.id + " .c-sel").slideDown();
						}
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers)
					});
			},

			makeVariables: function(t){
				t.selectedCountry = 0;
				t.countries = 1;
				t.layerDefs = [];
				t.atts = [];
				t.mitPoten = ["mangrove_max","peat_loss_max","legumes_max","optint_max","rice_max","natfor_max","peat_res_max","refor_max"]
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
