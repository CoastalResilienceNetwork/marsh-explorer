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
				
				// mitigation pathways chart
				var ctx = $("#" + t.id + "pathwayChart");
				t.mitPathChart = new Chart(ctx, {
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
				// Commitment chart
				var ctx1 = $("#" + t.id + "commitmentChart");
				var data = {
				  labels: ["", ""],
				  datasets: [{
				      backgroundColor: "#8fb440",
				      borderColor: "#8fb440",
				      data: [0,40]
				    }, {
				      backgroundColor: "#408CB4",
				      borderColor: "#408CB4",
				      data: [0,60]
				    }, {
				      backgroundColor: "#A14612",
				      borderColor: "#A14612",
				      data: [85,0]
				    }]
				};

				t.mitParis = new Chart(ctx1, {
				  type: 'bar',
				  data: data,
				  options: {
				    scales: {
				  		xAxes: [{stacked: true}],
				    	yAxes: [{
				      	stacked: true,
				      	ticks: {
				        	beginAtZero: true 
				         }
				      }]
				    }
				  }
				});

			},
			updateChart: function(t){
				var max = 0;
				$.each(t.pwArray,function(i,v){
					max = max + v;
				})
				t.mitParis.data.datasets[1].data = [0,t.twoDeg];
				t.mitParis.data.datasets[1].data = [0,max];
				t.mitParis.data.datasets[2].data = [t.parisBar,0];
				t.mitParis.update();
				t.mitPathChart.data.datasets[0].data = t.pwArray;
				t.mitPathChart.update();
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