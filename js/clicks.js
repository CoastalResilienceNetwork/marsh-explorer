define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$("#" + t.id + "selectCountry").chosen({allow_single_deselect:true, width:"180px"})
					.change(function(c){
						var val = c.target.value;
						// check for a deselect
						if (val.length == 0){
							$("#" + t.id + "top-wrap .c-sel").slideUp();
						}else{
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
									$.each(t.mitPoten,function(i1,v1){
										if(v[v1] != "NA"){
											y = y + Number(v[v1]);
										}
									})	
									y = t.clicks.roundTo(y, 4)
									y = t.clicks.commaSeparateNumber(y)
									$("#" + t.id + "nscMitPoten").html(y);
								}
							})
							$("#" + t.id + "top-wrap .c-sel").slideDown();
						}
					});
			},

			makeVariables: function(t){
				t.ncsGlobalCountries = 0;
				t.atts = [];
				t.mitPoten = ["refor_max","natfor_max","legumes_max","optint_max","rice_max","peat_res_max","peat_loss_max","mangrove_max"]
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
