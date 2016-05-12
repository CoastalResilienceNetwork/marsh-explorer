require({
    // Specify library locations.
    packages: [
        {
            name: "jquery",
            location: "//ajax.googleapis.com/ajax/libs/jquery/1.9.0",
            main: "jquery.min"
        }
    ]
});

app = {}

define([
	"dojo/_base/declare",
	"framework/PluginBase",
	'plugins/floodplain_explorer/ConstrainedMoveable',
		
	"esri/request",
	"esri/layers/ArcGISDynamicMapServiceLayer",
	"esri/layers/ImageParameters",
	"esri/layers/ArcGISImageServiceLayer",
	"esri/layers/ImageServiceParameters",
	"esri/layers/RasterFunction",
	"esri/tasks/ImageServiceIdentifyTask",
	"esri/tasks/ImageServiceIdentifyParameters",
	"esri/tasks/IdentifyParameters",
	"esri/tasks/IdentifyTask",
	"esri/tasks/QueryTask",
	"esri/tasks/query",
	"esri/graphicsUtils",
	"esri/geometry/Extent", 
	"esri/SpatialReference",
		
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/layers/FeatureLayer",
	"dojo/_base/Color",
	
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/DropDownMenu", 
	"dijit/MenuItem",
	"dijit/layout/ContentPane",
	"dijit/form/HorizontalSlider",
	"dojox/form/RangeSlider",
	"dijit/form/HorizontalRule",
	"dijit/form/CheckBox",
	"dijit/form/RadioButton",
	"dijit/form/TextBox",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/dom-geometry",
		
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/query",
	"dojo/parser",
	"dojo/NodeList-traverse",
        
	"dojo/text!./floodplainexplorer.json"

	//plugins/restoration_explorer/
],
function (declare, 
	PluginBase, 
	ConstrainedMoveable,
	ESRIRequest,
	ArcGISDynamicMapServiceLayer,
	ImageParameters,
	ArcGISImageServiceLayer,
	ImageServiceParameters,
	RasterFunction,
	ImageServiceIdentifyTask,
	ImageServiceIdentifyParameters,
	IdentifyParameters,
	IdentifyTask,
	QueryTask,
	esriQuery,
	graphicsUtils,
	Extent, 
	SpatialReference,
	SimpleLineSymbol,
	SimpleFillSymbol,
	SimpleMarkerSymbol,
	FeatureLayer,
	Color,
	Button,
	DropDownButton, 
	DropDownMenu, 
	MenuItem,
	ContentPane,
	HorizontalSlider,
	RangeSlider,
	HorizontalRule,
	CheckBox,
	RadioButton,
	Textbox,
	dom,
	domClass,
	domStyle,
	win,
	domConstruct,
	domAttr,
	domGeom,
	array,
	lang,
	on,
	dojoquery,
	parser,
	domNodeTraverse,
	explorer
){
	return declare(PluginBase, {
		toolbarName: "Floodplain Explorer",
        toolbarType: "sidebar",
		showServiceLayersInLegend: true,
        allowIdentifyWhenActive: false,
		_hasactivated: false,
		infoGraphic: "plugins/floodplain_explorer/FloodplainExplorer.jpg",
		height: 550,
        activate: function () { 
			if (this.currentLayer != undefined)  {
				this.currentLayer.setVisibility(true);
			}
			if ((this._hasactivated == false) && (this.explorerObject.regions.length == 1)) {
				this.changeGeography(this.explorerObject.regions[0], true);
			};
			this._hasactivated = true;
			//this.render();
		},
        
		deactivate: function () { 
			
		},
			   
		hibernate: function () { 
			if (this.currentLayer != undefined)  {
				this.currentLayer.setVisibility(false);
			}
			this.featureLayer.clear();

			if (this.sliderpane != undefined) { 
				this.sliderpane.destroy();
				this.map.removeLayer(this.currentLayer)
			}
			if (this.buttonpane != undefined) { 
				this.buttonpane.destroy();
			}	
			//domStyle.set(this.textnode, "display", "");
			this._hasactivated = false;
			this.explorerObject = dojo.eval("[" + explorer + "]")[0];
			$('.dijitContentPane').css("margin-top","0px");
		},
			   
		render: function() {
			
		},		
				
		resize: function(w, h) {
			cdg = domGeom.position(this.container);
			if (cdg.h == 0) {
				this.sph = this.height - 12 
			} 
			else {
				this.sph = cdg.h-52;
			}
			domStyle.set(this.sliderpane.domNode, "height", this.sph + "px");
		},
			   
		initialize: function (frameworkParameters) {
				
			declare.safeMixin(this, frameworkParameters);
			domClass.add(this.container, "claro");
			this.explorerObject = dojo.eval("[" + explorer + "]")[0];
			
			con = dom.byId('plugins/floodplain_explorer-0');
			domStyle.set(con, "width", "295px");
			domStyle.set(con, "height", "520px");
			
			if (this.explorerObject.betweenGroups == undefined) {
				this.explorerObject.betweenGroups = "+";
			}
					
		//	this.textnode = domConstruct.create("div", { innerHTML: "<p style='padding:8px;'>" + this.explorerObject.text + "</p>" });
		//	dom.byId(this.container).appendChild(this.textnode);
			
			pslidernode = domConstruct.create("span", { innerHTML: "<span style='padding:0px;'> </span>" });
			dom.byId(this.container).appendChild(pslidernode); 
				
			nslidernode = domConstruct.create("span");
			dom.byId(this.container).appendChild(nslidernode); 
			
						
	
			//menu = new DropDownMenu({ style: "display: none;"});
					
			//domClass.add(menu.domNode, "claro");
					
		/*	array.forEach(this.explorerObject.regions, lang.hitch(this,function(entry, i){
					
				menuItem1 = new MenuItem({
					label: entry.name,
					onClick: lang.hitch(this,function(e){this.changeGeography(entry)})
				});
				menu.addChild(menuItem1);
			}));
		*/
			this.refreshnode = domConstruct.create("span", {style: "display:none"});
			
			domClass.add(this.refreshnode, "plugin-report-spinner");

			dom.byId(this.container).appendChild(this.refreshnode);
					
			a = dojoquery(this.container).parent();
					
			this.infoarea = new ContentPane({
				style:"z-index:10000; !important;position:absolute !important;left:310px !important;top:-5px !important;width:295px !important; max-height:460px !important; background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
				innerHTML: "<div class='infoareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='infoareacontent' style='padding-top:5px'>no content yet</div>"
			});
					
			dom.byId(a[0]).appendChild(this.infoarea.domNode)
					
			ina = dojoquery(this.infoarea.domNode).children(".infoareacloser");
			this.infoAreaCloser = ina[0];

			inac = dojoquery(this.infoarea.domNode).children(".infoareacontent");
			this.infoareacontent = inac[0];

			on(this.infoAreaCloser, "click", lang.hitch(this,function(e){
				domStyle.set(this.infoarea.domNode, 'display', 'none');
			}));
		},
				
		changeGeography: function(geography, zoomto) {
			if (zoomto == undefined) {
				zoomto = true;
			}
			  		   
			this.geography = geography;
			     
			if (this.sliderpane != undefined) { 
				this.sliderpane.destroy();
				this.map.removeLayer(this.currentLayer)
			}
					
			this.sliderpane = new ContentPane({});
					
			dom.byId(this.container).appendChild(this.sliderpane.domNode);

			this.buttonpane = new ContentPane({
				style:"border-top-style:groove !important; height:50px;overflow: hidden !important;background-color:#F3F3F3 !important;padding:2px !important;"
			});
					
			dom.byId(this.container).appendChild(this.buttonpane.domNode);
			this.methods = this.explorerObject.methods
			if (this.methods != undefined) {
				methodsButton = new Button({
					label: "Methods",
					style:  "float:right !important;",
					onClick: lang.hitch(this,function(){window.open(this.methods)})
				});
				this.buttonpane.domNode.appendChild(methodsButton.domNode);
			}
			   
		//	domStyle.set(this.textnode, "display", "none");
					
			if (this.explorerObject.globalText != undefined) {
				explainText = domConstruct.create("div", {style:"margin-top:-5px;margin-bottom:10px", innerHTML: this.explorerObject.globalText});
				this.sliderpane.domNode.appendChild(explainText);
			}
		
		//	box = dom.byId("dijit_layout_ContentPane_1");
		//	domStyle.set(box,"margin-top","-20px");
			 
			array.forEach(geography.items, lang.hitch(this,function(entry, i){
				if (entry.group == undefined) {
					entry.group = "ungrouped";
				}
				if (entry.type == "hr") {
					hrn = domConstruct.create("hr", {style:""});
					this.sliderpane.domNode.appendChild(hrn);
				}
				if (entry.type == "header") {
					nslidernodeheader = domConstruct.create("div", {style:"margin-top:0px;margin-bottom:10px", innerHTML: "<b>" + entry.text + ":</b>"});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
				} 
				if (entry.type == "text") {
					nslidernodeheader = domConstruct.create("div", {style:"margin-top:5px;margin-bottom:7px", innerHTML: entry.text});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
				} 
				if (entry.type == "anchor") {
					anchorhtml = "<span id='" + this.sliderpane.id + "moreInfo' style='cursor:pointer;color:#428229;text-decoration:underline;'>" + entry.text + "</span>"
					anchornode = domConstruct.create("div", {style:"margin-top:5px;margin-bottom:10px", innerHTML: anchorhtml});
					this.sliderpane.domNode.appendChild(anchornode);
					
					var minfo = dojo.byId(this.sliderpane.id + 'moreInfo');
					dojo.connect(minfo, "onclick", lang.hitch(this,function(e) {
						domStyle.set(this.moreInfo.domNode, 'display', '');
						domStyle.set(this.infoarea.domNode, 'display', 'none');
					}));
				}
				if (entry.type == "select") {
					inhtml = "<b>Selected Valley Bottom Segment -</b><span id='" + this.sliderpane.id + "clearSelect' style='cursor:pointer;color:blue;font-weight:bold;'> Clear</span>"
					nslidernodeheader = domConstruct.create("div", {id: this.sliderpane.id + entry.type, class:"mapselect_" + this.sliderpane.id , style:"display:none;margin-top:5px;margin-bottom:7px", innerHTML: inhtml});
					this.sliderpane.domNode.appendChild(nslidernodeheader);	
					
					selectnode = domConstruct.create("div", {id: this.sliderpane.id + "selectText", style:"margin-left:23px;color:#a14612;margin-bottom:10px"})
					nslidernodeheader.appendChild(selectnode);	
					
					var clear = dojo.byId(this.sliderpane.id + 'clearSelect');
					
					dojo.connect(clear, "onclick", lang.hitch(this,function(e) {
						this.clearSelect();
					}));
				} 
				if (entry.type == "textArea") {
					numnode = domConstruct.create("div", {style:"margin-top:7px",innerHTML:"<span id='" + this.sliderpane.id + "_featureNum'> Viewing 535 of 535 FPUs</span>"})
					this.sliderpane.domNode.appendChild(numnode);	
					
					spacenode = domConstruct.create("div", {style:"height:7px;"})
					this.sliderpane.domNode.appendChild(spacenode);	
					
					nslidernodetextarea = domConstruct.create("div", {style:"margin-top:-10px;margin-bottom:10px", innerHTML: entry.text});
					this.sliderpane.domNode.appendChild(nslidernodetextarea);	
					
					this.acres = 200;
					
					this.ta = new Textbox({
						name: "ta",
						value: "200",
						id: this.sliderpane.id + "ta",
						intermediateChanges: true,
						style: "width:3em;",
						onChange: lang.hitch(this,function(e) {
							this.acres = Number(e);
							if (this.f1c == "yes"){
								this.f1 = this.acres;
							}
							if (this.f2c == "yes"){
								this.f2 = this.acres;
							}
							if (this.f3c == "yes"){
								this.f3 = this.acres;
							}
							if (this.f4c == "yes"){
								this.f4 = this.acres;
							}
							if (this.f5c == "yes"){
								this.f5 = this.acres;
							}
							if (this.resc == "yes"){
								this.res = this.acres;
							}
							if (this.recc == "yes"){
								this.rec = this.acres;
							}
							this.updateService();
						})
					}, nslidernodetextarea);
					
					$('.dijitReset.dijitInputField.dijitInputContainer').css("height", "20px");
					$('#' + this.sliderpane.id + 'ta').css("height", "20px");
					
										
					textarealabel = domConstruct.create("div", {style:"display:inline;padding-left:5px", innerHTML: entry.text + "<br>"})
					this.sliderpane.domNode.appendChild(textarealabel);
					
					spacenode1 = domConstruct.create("div", {style:"height:7px;"})
					this.sliderpane.domNode.appendChild(spacenode1);	
				}
			
				if (entry.type == "layer") {	
					this.group = "fpu";				
					this.f1 = 0; 
					this.f2 = 0; 
					this.f3 = 0; 
					this.f4 = 0; 
					this.f5 = 0; 
					this.res = 0;
					this.rec = 0;
					this.haz = 0;
					this.sel = "no";
															
					nslidernodetitle = domConstruct.create("input", {style:"margin-top:0px;margin-bottom:0px;display:none !important", innerHTML: ""});
					this.sliderpane.domNode.appendChild(nslidernodetitle);
							
					this.FunctionCheck = new CheckBox({
						name: "FunctionCheck",
						value: 1,
						title: entry.text,
						checked: 0,
						id: entry.index + this.sliderpane.id,
						style: "margin-top:-7px; margin-right:2px",
						onChange: lang.hitch(this,function(e) {
							this.updateVis(entry, e);
						}),
					}, nslidernodetitle);
						
					parser.parse()
					
					this.img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAEZ0FNQQAAsY58+1GTAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAI2SURBVHjarJPfSxRRFMc/rrasPxpWZU2ywTaWSkRYoaeBmoVKBnwoJfIlWB8LekiaP2N76S9o3wPBKAbFEB/mIQJNHEuTdBmjUtq1mz/Xmbk95A6u+lYHzsvnnvO995xzTw3HLJfLDQNZIHPsaArIm6b54iisOZJ4ERhVFCWtaRqqqqIoCgBCCFzXxbZthBCzwIBpmquhwGHyTHd3d9wwDAqlA6a/bFMolQHobI5y41Ijnc1nsCwLx3E2gV7TNFfrDh8wWknOvy9hffoNwNNMgkKxzMu5X7z5KDCuniVrGABxx3FGgd7aXC43rCjKw6GhIV68K/J6QRBISSAl6fP1bO0HzH/bJZCSpY19dsoB9/QeHMdp13W9EAGymqaxUiwzNr+J7wehP59e5+2SqGJj85usFMtomgaQjQAZVVWZXKwO7O9SeHang8fXE1Xc9wMmFwWqqgJkIgCKorC8sYfnB6F/Xt+lIRpBSqq45wcsb+yFE6o0Ed8P8LwgnO+Mu80PcQBQxSuxFYtU5pxsjZ64SUqJlPIET7ZGEUKEAlOu69LXFT9FgFNL6OuK47ouwFQEyNu2TSoRYzDdguf9LUVLNpFqi5Fqi6Elm0I+mG4hlYhh2zZAvnZ8fHxW1/W7Qoj2B7d7Ebsec+4WzY11TCyUmFgosXcQ8LW0z/1rCZ7c7MCyLNbW1mZN03xUaeKA4zgzQHzEMOjvaeHVh58sft8B4Ep7AyO3LnD5XP3Rrzzw/5bpX9b5zwBaRXthcSp6rQAAAABJRU5ErkJggg=="
					
					mainchecknodetext = domConstruct.create("span", {style:"padding-top:10px;margin-top:0px;margin-bottom:10px;display:inline", innerHTML: "<span style='color:#000'><a style='color:black; margin-left:3px; margin-bottom:-10px' href='#' title='" + 'Click for more information.' + "'><img src='" + this.img + "'></a><span style='margin-left:3px;' id='" + entry.index + "'>" + entry.text  + "</span></span><br>", for: this.FunctionCheck.id});
					this.sliderpane.domNode.appendChild(mainchecknodetext);	

					spacenode = domConstruct.create("div", {style:"height:7px;"})
					this.sliderpane.domNode.appendChild(spacenode);			
							
					on(mainchecknodetext, "click", lang.hitch(this,function(e){
						domStyle.set(this.moreInfo.domNode, 'display', 'none');
						domStyle.set(this.infoarea.domNode, 'display', '');
						this.infoareacontent.innerHTML = "<b>" + entry.text + "</b><br><br>" + entry.help;
					}));
							
					this.sliderpane.domNode.appendChild(nslidernodetitle);
					
					nslidernode = domConstruct.create("div");
					this.sliderpane.domNode.appendChild(nslidernode); 
					
					if ( entry.lyrnum == 1 ) { this.f1q = entry.query }
					if ( entry.lyrnum == 2 ) { this.f2q = entry.query }
					if ( entry.lyrnum == 3 ) { this.f3q = entry.query }
					if ( entry.lyrnum == 4 ) { this.f4q = entry.query }
					if ( entry.lyrnum == 5 ) { this.f5q = entry.query }
					if ( entry.lyrnum == 6 ) { this.f6q = entry.query }
					if ( entry.lyrnum == 7 ) { this.f7q = entry.query }
					if ( entry.lyrnum == 8 ) { this.f8q = entry.query }
										
					if (entry.slide != undefined){
						ncontrolsnode = domConstruct.create("div", {id: this.sliderpane.id + "_" + entry.index, style: "display:none; margin-left:20px; margin-top:-7px; margin-bottom:10px;"});
						this.sliderpane.domNode.appendChild(ncontrolsnode);
						
						toplabel = domConstruct.create("div", {id: this.sliderpane.id + "topLabel",style:"margin-left:35px;margin-bottom:-3px;margin-top:5px",innerHTML:">$100 Million in Losses"});
						ncontrolsnode.appendChild(toplabel);
						
						array.forEach(entry.slide, lang.hitch(this,function(option, x){
							ncontrolnode = domConstruct.create("div", {id: this.sliderpane.id + "_slider"});
							ncontrolsnode.appendChild(ncontrolnode); 
							
							labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", 
								style:"height:1.5em;font-size:75%;color:#444;margin-top:5px", 
								innerHTML: "<li>$" + option.min + "</li><li>$" + option.mid + "</lli><li>$" + option.max + "</li>"});
							ncontrolnode.appendChild(labelsnode);
							
							slider = new HorizontalSlider({
								name: option.index,
								value: option.mid,
								minimum: option.min,
								maximum: option.max,
								showButtons: false,
								id: this.sliderpane.id + "_" + option.index,
								discreteValues: option.step,
								onChange: lang.hitch(this,function(value){
									this.haz = value * 1000000;
									this.updateService();
									$('#' + this.sliderpane.id + 'topLabel').html(">$" + value + " Million in Losses");
								}),
								style: "width:180px;margin-top:10px;margin-bottom:10px"
							}, this.sliderpane.id + "_slider").startup();			
							
							parser.parse()
							
						}));
					}
					//add div for selection 
					if (entry.sub != undefined){
						subnode = domConstruct.create("div", {id: this.sliderpane.id + entry.sub, class:"mapselect_" + this.sliderpane.id, style:"display:none;margin-left:23px;margin-top:-5px;margin-bottom:7px;color:#a14612;"});
						this.sliderpane.domNode.appendChild(subnode);	
					}					
				}
				
				if (entry.type == "featureLayer"){
					// Create feature layer for display
					this.featureLayer = new FeatureLayer(entry.url, {
						mode: esri.layers.FeatureLayer.MODE_SELECTION,
						outFields: entry.outfields
					});	
					// set feature layer symbology
					var lineSym0 = new SimpleLineSymbol().setColor(new Color(entry.lineSym0));
					lineSym0.setWidth(1.5);	
					this.featureLayer.setSelectionSymbol(lineSym0);	
					// add feature layer to map
					this.map.addLayer(this.featureLayer);	
					// select feature layer from map click
					dojo.connect(this.map, "onClick", lang.hitch(this,function(evt){ 
						this.featureLayer.clear();
						this.findFPUs(evt);						
					}));	
					// call function to capture and display selected feature layer attributes
					dojo.connect(this.featureLayer, "onSelectionComplete", lang.hitch(this,function(features){
						this.showAttributes(features);
					}));
				}
									
			}));
			
			a = dojoquery(this.container).parent();
			
			this.moreInfo = new ContentPane({
			  id: this.sliderpane.id + "infodiv",				
			  style:"display:none;z-index:10000 !important; position:absolute !important; left:310px !important; top:-5px !important; width:295px !important; !important; background-color:#FFF !important; border-style:solid !important; border-width:4px !important; border-color:#444 !important; border-radius:5px !important;",
			  innerHTML: "<div class='moreInfocloser' style='float:right !important;'><a href='#' style='color:#cecfce'>✖</a></div><div id='" + this.sliderpane.id + "infoHeader' style='background-color:#424542; color:#fff; height:28px; font-size:1em; font-weight:bold; padding:8px 0px 0px 10px; '>Floodplain Explorer Instructions</div>" +    
					"<div style='padding:10px; height:432px; overflow-y:scroll; '>The Floodplain Explorer shows sub-watershed units that contain ecological functions and flood hazards described below. Select one or more checkboxes to visualize where different ecological functions and flood hazards exist within an individual watershed unit.<br><br>" +
 					"Define a minimum acreage to determine the sum of all land area within a unit that support ecological function and/or restoration potential. Note this is not intended to define a restoration project size.<br><br>" +
					"Clicking on a watershed unit on the map will show additional information such as the name of the river system, total area, area of land that provides specific functions, and total economic and critical infrastructure losses.<br><br>" +
					"Press the <img src='" + this.img + "'> button to read a definition of the selected function.<br><br>" +
					"<b>Current Ecological Function</b><br>Selecting any of the current functions will show which units contain the total area of land that support the selected function in an amount equal to or greater than the minimum acres in the box above. Note that this land may or may not be contiguous, and may support one or multiple functions.<br><br>" +
					"<b>Potential Ecological Function</b><br>Selecting either of the potential actions will show which units have land that could be restored if action is taken in an amount equal to or greater than the minimum acres in the box above. This can be used as decision support for actions required to recover a specific function through the two restoration activities of reconnecting currently disconnect areas in the floodplain or restoring undeveloped land within the floodplain.<br><br>" +
					"<b>Flood Hazards</b><br>Selecting Building Losses under the Flood Hazards category will identify units where building losses equal to or exceed the dollar amount selected on the slider-bar.</div>"
				
			});
					
			dom.byId(a[0]).appendChild(this.moreInfo.domNode)
			
			ta = dojoquery(this.moreInfo.domNode).children(".moreInfocloser");
				this.moreInfocloser = ta[0];

			tac = dojoquery(this.moreInfo.domNode).children(".moreInfocontent");
			this.moreInfocontent = tac[0];
								
			on(this.moreInfocloser, "click", lang.hitch(this,function(e){
				domStyle.set(this.moreInfo.domNode, 'display', 'none');
			}));
			
			/*var p = new ConstrainedMoveable(
				dom.byId(this.sliderpane.id + "infodiv"), {
				handle: dom.byId(this.sliderpane.id + "infoHeader"),	
				within: true
			});*/
			
			this.imageParameters = new ImageParameters();
			this.layerDefs = [];
			this.imageParameters.layerDefinitions = this.layerDefs;	
			this.vis = [1];
			this.imageParameters.layerIds = this.vis;
			this.imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
			this.imageParameters.transparent = true;
			this.currentLayer = new ArcGISDynamicMapServiceLayer(geography.url, {opacity:0.7, "imageParameters": this.imageParameters});
			
			dojo.connect(this.currentLayer, "onLoad", lang.hitch(this,function(e){
				this.updateService(zoomto);
			}));
						
			this.map.addLayer(this.currentLayer,1);
		

			this.resize();
		},
		
		findFPUs: function(evt){
			// this.featureLayer.clear();
			var selectionQuery = new esriQuery();
			var tol = this.map.extent.getWidth()/this.map.width * 1;
			var x = evt.mapPoint.x;
			var y = evt.mapPoint.y;
			var queryExtent = new esri.geometry.Extent(x-tol,y-tol,x+tol,y+tol,evt.mapPoint.spatialReference);
			selectionQuery.geometry = queryExtent;
			selectionQuery.outfields = [ "*" ];
			this.featureLayer.selectFeatures(selectionQuery,esri.layers.FeatureLayer.SELECTION_NEW);
		},
		
		showAttributes: function(features) {
			this.sel = "yes";
			atts = features[0].attributes;
			console.log(atts);
			toAcres = numberWithCommas(atts.AcresRound)
			$('#' + this.sliderpane.id + 'selectText').html("<b>" + atts.River + "</b> River System<br><b>" + toAcres + "</b> Acres in Selected Area");
			$('#' + this.sliderpane.id + 'select').slideDown();
			// attributes for fn1
			fn1high = Math.round(atts.fn1_highFPacres);
			fn1high = numberWithCommas(fn1high);
			fn1low = Math.round(atts.fn1_lowFPacres);
			fn1low = numberWithCommas(fn1low);
			$('#' + this.sliderpane.id + 'fn1Sub').html("<b>" + fn1high + "</b> Acres High Floodplain<br><b>" + fn1low + "</b> Acres Low Floodplain");
		//	if (this.f1c == "yes") {
				$('#' + this.sliderpane.id + 'fn1Sub').slideDown();
		//	}
			//attributes for fn2
			fn2forest = Math.round(atts.fn2_forestAcres);
			fn2forest = numberWithCommas(fn2forest);
			fn2nforest = Math.round(atts.fn2_nonforestAcres);
			fn2nforest = numberWithCommas(fn2nforest);
			$('#' + this.sliderpane.id + 'fn2Sub').html("<b>" + fn2forest + "</b> Acres Forested<br><b>" + fn2nforest + "</b> Acres Non Forested");
		//	if (this.f2c == "yes") {
				$('#' + this.sliderpane.id + 'fn2Sub').slideDown();
		//	}
			//attributes for fn3
			fn3total = Math.round(atts.fn3_acres);
			fn3total = numberWithCommas(fn3total);
			$('#' + this.sliderpane.id + 'fn3Sub').html("<b>" + fn3total + "</b> Acres Capacity");
		//	if (this.f3c == "yes"){
				$('#' + this.sliderpane.id + 'fn3Sub').slideDown();
		//	}	
			//attributes for fn4
			fn4fw = Math.round(atts.fn4_acres);
			fn4fw = numberWithCommas(fn4fw);
			$('#' + this.sliderpane.id + 'fn4Sub').html("<b>" + fn4fw + "</b> Acres Forest and Welands");
		//	if (this.f4c == "yes"){
				$('#' + this.sliderpane.id + 'fn4Sub').slideDown();
		//	}
			//attributes for fn5
			fn5re = Math.round(atts.fn5_acres);
			fn5re = numberWithCommas(fn5re);
			$('#' + this.sliderpane.id + 'fn5Sub').html("<b>" + fn5re + "</b> Acres River Edge")
		//	if (this.f5c == "yes"){
				$('#' + this.sliderpane.id + 'fn5Sub').slideDown();
		//	}
			//attributes for fn6
			fn6rec = Math.round(atts.reconnect_acres);
			fn6rec = numberWithCommas(fn6rec);
			console.log(fn6rec);
			$('#' + this.sliderpane.id + 'fn6Sub').html("<b>" + fn6rec + "</b> Acres Reconnection Potential")
		//	if (this.recc == "yes"){
				$('#' + this.sliderpane.id + 'fn6Sub').slideDown();
		//	}
			//attributes for fn7
			fn7res = Math.round(atts.restore_acres);
			fn7res = numberWithCommas(fn7res);
			$('#' + this.sliderpane.id + 'fn7Sub').html("<b>" + fn7res + "</b> Acres Restoration Potential")
		//	if (this.resc == "yes"){
				$('#' + this.sliderpane.id + 'fn7Sub').slideDown();
		//	}
			//attributes for Hazus
			hazLoss = atts.TotalLoss;
			hazLoss = numberWithCommas(hazLoss);
			ag = Math.round(atts.AgAcres);
			ag = numberWithCommas(ag);
			$('#' + this.sliderpane.id + 'hazSub').html("$<b>" + hazLoss + "</b> Loss in Selected Area<br><b>" + 
				ag + "</b> Acres Agriculture<br><b>" +
				atts.CareFacility + "</b> Care Facilities<br><b>" + 
				atts.FireStation + "</b> Fire Stations<br><b>" + 
				atts.PoliceStation + "</b> Police Stations<br><b>" + 
				atts.School + "</b> Schools");
			//$('#hazSub').css("margin-left", "20px");
		//	if (this.hazc == "yes") {
				$('#' + this.sliderpane.id + 'hazSub').slideDown();
		//	}
		},
				
		updateService: function(zoomto) {
			if (zoomto == undefined) {
				zoomto = false;
			}
			this.layerDefs[0] = this.f1q + " >= " + this.f1 + " AND " + this.f2q + " >= " + this.f2 + 	
				" AND " + this.f3q + " >= " + this.f3 + " AND " + this.f4q + " >= " + this.f4 +	
				" AND " + this.f5q + " >= " + this.f5 + " AND " + this.f6q + " >= " + this.rec + 
				" AND " + this.f7q + " >= " + this.res + " AND " + this.f8q + " >= " + this.haz;				
		/*	this.layerDefs[5] = "fn1_100_sqkm_reach >= " + this.f1 + " AND fn2_100_sqkm_reach >= " + this.f2 + 
				" AND fn3_100_sqkm_reach >= " + this.f3 + " AND fn4_100_sqkm_reach >= " + this.f4 +	
				" AND fn5_100_sqkm_reach >= " + this.f5 +
				" AND reconnect_sqkm_reach >= " + this.rec + " AND restore_sqkm_reach >= " + this.res;
			this.layerDefs[0] = "reconnect_sqkm >= " + this.rec ;
			this.layerDefs[1] = "restore_sqkm >= " + this.res ;
			this.layerDefs[3] = "reconnect_sqkm_reach >= " + this.rec ;
			this.layerDefs[4] = "restore_sqkm_reach >= " + this.res ;			
		*/	
			
			this.currentLayer.setLayerDefinitions(this.layerDefs);
			
			this.numberQuery();	
		},	
		
		numberQuery: function() {
			if (this.group == "fpu"){
				var fpuQT = new esri.tasks.QueryTask("http://dev.services2.coastalresilience.org/arcgis/rest/services/Puget_Sound/Floodplain_Explorer/MapServer/0");
				var fpuquery = new esri.tasks.Query();
				fpuquery.where = this.f1q + " >= " + this.f1 + " AND " + this.f2q + " >= " + this.f2 + 	
				" AND " + this.f3q + " >= " + this.f3 + " AND " + this.f4q + " >= " + this.f4 +	
				" AND " + this.f5q + " >= " + this.f5 + " AND " + this.f6q + " >= " + this.rec + 
				" AND " + this.f7q + " >= " + this.res + " AND " + this.f8q + " >= " + this.haz;
				var spid = this.sliderpane.id;
				fpuQT.executeForCount(fpuquery,function(count){
					this.fpuNum = "Viewing <b>" + count.toString() + "</b> of <b>535</b> segments";
					dojo.byId(spid + '_featureNum').innerHTML = this.fpuNum ;
				},function(error){
					console.log(error);
				});
			}	
			
			if (this.group == "reach"){
				var reachQT = new esri.tasks.QueryTask("http://dev.services2.coastalresilience.org/arcgis/rest/services/Puget_Sound/Floodplain_Explorer/MapServer/3");
				var reachquery = new esri.tasks.Query();
				reachquery.where = "fn1_high_sqkm_reach >= " + this.f1 + " AND fn2_100_sqkm_reach >= " + this.f2 + 
					" AND fn3_100_sqkm_reach >= " + this.f3 + " AND fn4_100_sqkm_reach >= " + this.f4 +	
					" AND fn5_100_sqkm_reach >= " + this.f5 +
					" AND reconnect_sqkm_reach >= " + this.rec + " AND restore_sqkm_reach >= " + this.res;
				reachQT.executeForCount(reachquery,function(count){
					this.reachNum = "Viewing <b>" + count.toString() + "</b> of <b>54</b> reaches";
					dojo.byId(this.sliderpane.id + "_featureNum").innerHTML = this.reachNum ;
				},function(error){
					console.log(error);
				});
			}
		},
		
	/*	switchLayers: function(val,group) {
			array.forEach(this.explorerObject.regions[0].items[group].options, lang.hitch(this,function(option, i){
				option.selected = false
				dijit.byId("radio_" + i).set('checked', false);
			}));
			
			this.explorerObject.regions[0].items[group].options[val].selected = true;
			dijit.byId("radio_" + val).set('checked', true);
			
			array.forEach(this.explorerObject.regions[0].items[group].options, lang.hitch(this,function(option, i){
				if (option.selected == true){
					if (option.value == "fpu"){
						this.group = "fpu";
						this.numberQuery();
						var index = this.vis.indexOf(5);
						if (index > -1) {
							this.vis.splice(index, 1);
						}
						this.vis.push(2);
						this.currentLayer.setVisibleLayers(this.vis);
						
						$('#reconnect').text("Reconnect (Floodplain Unit)")
						$('#restore').text("Restore (Floodplain Unit)")
						
						var recChecked = dijit.byId("reconnect_cb").checked;
						var resChecked = dijit.byId("restore_cb").checked;
						/*
						if (recChecked === true){
							index = this.vis.indexOf(3);
							if (index > -1) {
								this.vis.splice(index, 1);
							}
							this.vis.push(0);
							this.currentLayer.setVisibleLayers(this.vis);
						}
						if (resChecked === true){
							index = this.vis.indexOf(4);
							if (index > -1) {
								this.vis.splice(index, 1);
							}
							this.vis.push(1);
							this.currentLayer.setVisibleLayers(this.vis);
						}
						
					}
					if (option.value == "reach"){
						this.group = "reach";
						this.numberQuery();
						var index = this.vis.indexOf(2);
						if (index > -1) {
							this.vis.splice(index, 1);
						}
						this.vis.push(5);
						this.currentLayer.setVisibleLayers(this.vis);
						
						$('#reconnect').text("Reconnect (Reach)")
						$('#restore').text("Restore (Reach)")
						
						// change potential layers
						var recChecked = dijit.byId("reconnect_cb").checked;
						var resChecked = dijit.byId("restore_cb").checked;
						
						if (recChecked === true){
							index = this.vis.indexOf(0);
							if (index > -1) {
								this.vis.splice(index, 1);
							}
							this.vis.push(3);
							this.currentLayer.setVisibleLayers(this.vis);
						}
						if (resChecked === true){
							index = this.vis.indexOf(1);
							if (index > -1) {
								this.vis.splice(index, 1);
							}
							this.vis.push(4);
							this.currentLayer.setVisibleLayers(this.vis);
						}
						
					}	
				}
			}));
						
		},	*/
		
		// Change query fields on individual functions (nested radio buttons)
	/*	switchQuery: function(val,group) {
			// turn all radio button selection to false
			array.forEach(this.explorerObject.regions[0].items[group].sub, lang.hitch(this,function(option, i){
				option.selected = false
				dijit.byId("radioFQ_" + i).set('checked', false);
			}));
			// turn selected radion button selection to true and change json array to true
			this.explorerObject.regions[0].items[group].sub[val].selected = true;
			dijit.byId("radioFQ_" + val).set('checked', true);
			// update query fields
			array.forEach(this.explorerObject.regions[0].items[group].sub, lang.hitch(this,function(option, i){
				if (option.selected == true){
					if (option.value == "high"){
						this.f1q = "fn1_high_sqkm";
						this.updateService();
					}
					if (option.value == "low"){
						this.f1q = "fn1_low_sqkm";
						this.updateService();
					}	
				}
			}));
		},
	*/	
		updateVis: function(entry, e){
			if (entry.text == "Store and Route Floodwaters"){
				if (e === true){ 
					this.f1 = this.acres; 
					this.f1c = "yes";
				//	if (this.sel == "yes"){
				//		$('#fn1Sub').slideDown();
				//	}
				}
				else{ 
					this.f1 = 0; 
					this.f1c = "no";
				//	$('#fn1Sub').slideUp();
				}				
			}
			if (entry.text == "Supply Sediment and Wood"){
				if (e === true){ 
					this.f2 = this.acres; 
					this.f2c = "yes";
				//	if (this.sel == "yes"){
				//		$('#fn2Sub').slideDown();
				//	}
				}
				else{ 
					this.f2 = 0; 
					this.f2c = "no";
				//	$('#fn2Sub').slideUp();
				}	
			}
			if (entry.text == "Retain and Transform Water Pollutants"){
				if (e === true){ 
					this.f3 = this.acres; 
					this.f3c = "yes";
				//	if (this.sel == "yes"){
				//		$('#fn3Sub').slideDown();
				//	}
				}
				else{ 
					this.f3 = 0; 
					this.f3c = "no";
				//	$('#fn3Sub').slideUp();
				}	
			}
			if (entry.text == "Support Floodplain Forest Ecosystems"){
				if (e === true){ 
					this.f4 = this.acres; 
					this.f4c = "yes";
				//	if (this.sel == "yes"){
				//		$('#fn4Sub').slideDown();
				//	}
				}
				else{ 
					this.f4 = 0; 
					this.f4c = "no";
				//	$('#fn4Sub').slideUp();
				}	
			}
			if (entry.text == "Salmon Habitat"){
				if (e === true){ 
					this.f5 = this.acres; 
					this.f5c = "yes";
				//	if (this.sel == "yes"){
				//		$('#fn5Sub').slideDown();
				//	}
				}
				else{ 
					this.f5 = 0; 
					this.f5c = "no";
				//	$('#fn5Sub').slideUp();
				}	
			}
			if (entry.text == "Restore Connectivity"){
				if (e === true){ 
					this.rec = this.acres; 
					this.recc = "yes";	
				}
				else{ 
					this.rec = 0; 
					this.recc = "no";
				}	
			}
			if (entry.text == "Restore Condition"){
				if (e === true){ 
					this.res = this.acres; 
					this.resc = "yes";
				}
				else{ 
					this.res = 0; 
					this.resc = "no";
				}
			}
			if (entry.text == "Building Losses"){
				if (e === true){ 
					this.haz = dijit.byId(this.sliderpane.id + "_hazloss").value * 1000000
					this.hazc = "yes";
					$('#' + this.sliderpane.id + '_hazard').slideDown();
				//	if (this.sel == "yes"){
				//		$('#hazSub').slideDown();
				//	}
				}
				else{ 
					this.haz = 0; 
					this.hazc = "no";
					$('#' + this.sliderpane.id + '_hazard').slideUp();
				//	$('#hazSub').slideUp();
				}	
			}
			if ( this.f1c == "yes" || this.f2c == "yes" || this.f3c == "yes" || 
				 this.f4c == "yes" || this.f5c == "yes" || this.resc == "yes" || 
				 this.recc =="yes" || this.hazc == "yes") {
				this.currentLayer.setVisibleLayers([0,1]);
			} else{
				this.currentLayer.setVisibleLayers([1]);
			}
			this.updateService();
		},
		
		clearSelect: function () {
			$('.' + "mapselect_" + this.sliderpane.id).slideUp();
			this.sel = "no";
			this.featureLayer.clear();
			console.log("clear")
		},
		
		getState: function () { 
			state = this.geography;
			return state
		},
				
		setState: function (state) { 
			this.changeGeography(state,false);
		},
    });
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/*
function hClick(){
	$('#hSub' ).slideToggle();
	if (this.hab == 'closed'){
		$('#hToggle').html('&#x25BC;')
		this.hab = "open";
	}
	else{
		$('#hToggle').html('&#x25B6;')
		this.hab = "closed";
	}
}
function iClick(){
	$('#iSub' ).slideToggle();
	if (this.inf == 'closed'){
		$('#iToggle').html('&#x25BC;')
		this.inf = "open";
	}
	else{
		$('#iToggle').html('&#x25B6;')
		this.inf = "closed";
	}
}
function lClick(){
	$('#lSub' ).slideToggle();
	if (this.lan == 'closed'){
		$('#lToggle').html('&#x25BC;')
		this.lan = "open";
	}
	else{
		$('#lToggle').html('&#x25B6;')
		this.lan = "closed";
	}
}
function sClick(){
	$('#sSub' ).slideToggle();
	if (this.soc == 'closed'){
		$('#sToggle').html('&#x25BC;')
		this.soc = "open";
	}
	else{
		$('#sToggle').html('&#x25B6;')
		this.soc = "closed";
	}
}
*/