define([
	"dojo/_base/declare", "dojo/on", "dojo/dom", "./Chart_v2.4.0"
],
function ( declare, on, dom, Chart ) {
        "use strict";

        return declare(null, {
			createChart: function(t){
				// Set global chart variables
				Chart.defaults.global.tooltips.enabled = false;
				Chart.defaults.global.legend.display = false;
				
				var ctx = $("#" + t.id + "pathwayChart");
				t.myChart = new Chart(ctx, {
				    type: 'horizontalBar',
				    data: {
				        labels: ["", "", "", "", "", "", "", ""],
				        datasets: [{
				            label: '# of Votes',
				            data: [12, 19, 3, 1400, 8, 3, 7, 9],
				            backgroundColor:'rgb(143,204,140)',
				            borderWidth: 0
				        }]
				    },
				    options: {
				        scales: {
				            xAxes: [{ ticks: { beginAtZero:true, max:40 } }]
				        }
				    }
				});
			},
			updateChart: function(t){
				t.myChart.data.datasets[0].data = t.pwArray;
				t.myChart.update();
				$("#" + t.id + " .pathway-label").each(function(i,v){
					if (t.lblArray[i] == -99){
						$(v).html("N/A")
					}else{
						var y = t.clicks.roundTo(t.lblArray[i], 4)
						y = t.clicks.commaSeparateNumber(y)
						$(v).html(y)
					}
				})
			}			
		});
    }
)