define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/DiagramWidget.html",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/dom-construct",
		"dojo/dom"],
    function(declare, _WidgetBase, _TemplatedMixin, template, domStyle, domAttr, domCons, dom){
	
        return declare("DiagramWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			moveCount : 0,
			
			activeDiagramRow: null,
			
			nextCell : null,
			
			prevCell : null,
			
			postCreate : function(){
			
				this.initUi()
			},
			
			append : function(moveString){
			
				if(this.prevCell){
					domStyle.set(this.prevCell, "backgroundColor", "white")
				}
			
				if(moveString.indexOf("#") != -1){
					moveString = moveString.substring(0, moveString.length-1) + "<span style='font-family:Tahoma'>#</span>"
				}
				
				if(this.moveCount < 20){
					var cell = dom.byId("move" + this.moveCount)
					domAttr.set(cell, "innerHTML", moveString)
					domStyle.set(cell, "backgroundColor", "#dcdbe1")
					this.prevCell = cell
				}
				else{
					if(this.moveCount % 2 === 0){
						this.activeDiagramRow = domCons.create("tr", null, this.diagramTable)
						domCons.create("td", {innerHTML : (this.moveCount / 2) + 1, style :{width: "35px", height: "18px", fontFamily: "Tahoma", fontSize: "11px", fontWeight: "bold"}}, this.activeDiagramRow)
						this.prevCell = domCons.create("td", {innerHTML : moveString, style :{width: "85px", height: "18px", backgroundColor: "#dcdbe1"}}, this.activeDiagramRow)
						this.nextCell = domCons.create("td", {style :{width: "85px", height: "18px"}}, this.activeDiagramRow)
					}
					else{
					
						domAttr.set(this.nextCell, "innerHTML", moveString)
						domStyle.set(this.nextCell, "backgroundColor", "#dcdbe1")
						this.prevCell = this.nextCell
					}
					
					
					this.containerNode.scrollTop = this.containerNode.scrollHeight
				}
				
				this.moveCount++
			},
			
			initUi : function(){
				for(var i = 0; i < 20; i++){
				
					if(i%2 == 0){
						this.activeDiagramRow = domCons.create("tr", { style :{height: "18px"}}, this.diagramTable)
						domCons.create("td", {innerHTML : (i / 2) + 1, style :{width: "35px", height: "18px", fontFamily: "Tahoma", fontSize: "11px", fontWeight: "bold"}}, this.activeDiagramRow)
						
						domCons.create("td", {id : "move" + i , style :{width: "85px", height: "18px"}}, this.activeDiagramRow)
						domCons.create("td", {id : "move" + (i+1) , style :{width: "85px", height: "18px"}}, this.activeDiagramRow)
					}
				}
			},
		
			reset : function(){
			
				this.moveCount = 0
				this.activeDiagramRow = null
				this.nextCell = null
				this.prevCell = null
				
				domCons.empty(this.diagramTable)
				this.initUi()
			}
	});
})