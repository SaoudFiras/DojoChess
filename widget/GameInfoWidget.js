define(["dojo/_base/declare",
		"dojo/on",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/GameInfoWidget.html",
		"dojo/dom-style",
		"dojo/dom-attr",
		"dojo/_base/window",
		"/widget/UserPanelWidget.js"],
    function(declare, on, _WidgetBase, _TemplatedMixin, 
	template, domStyle, domAttr, win, UserPanelWidget){
	
        return declare("GameInfoWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			hostPanel : null,
			
			opponentPanel : null,
			
			watchersPanel : null,
			
			game : null,
			
			lobbyWidget : null,
			
			postCreate : function(){

				this.initUi()
				
				this.updateUserPanels()
				this.updateDescriptionView()
				
				var self = this
				
				this.own(this.game.watch("description", function(attr, oldVal, newVal) {
					self.updateDescriptionView()
                }))
				
				this.own(this.game.watch("numberOfUsers", function(attr, oldVal, newVal) {
					self.updateUserPanels()
                }))
			},
			
			isShowing: function(){
				return domStyle.get(this.containerNode, "display") === "block"
			},
			
			hide : function(){
				domStyle.set(this.containerNode, "display", "none")
			},
			
			show : function(x,y){
			
				var self = this
				
				domStyle.set(this.containerNode, "left",( x + 90) + "px")
				domStyle.set(this.containerNode, "top", (y + 105) + "px")
				domStyle.set(this.containerNode, "display", "block")
				
				var handle = on(win.body(), "click", function(e){
								
								if(e.gameId && e.gameId == self.game.gameId){
									return
								}
								
								if(!self.contains(e.target)){
									self.hide()
									handle.remove()
								}
							})
			},
			
			updateDescriptionView : function(){
				domAttr.set(this.descriptionLabel, "innerHTML", this.game.description.replace("\n", "<br>"))
			},
			
			updateUserPanels : function(){
				this.hostPanel.reset()
				this.opponentPanel.reset()
				this.watchersPanel.reset()
				
				var self = this
				
				this.game.users.forEach( function(user, i){
						
						var targetPanel = i === 0 ? self.hostPanel : 
												   i === 1 ? self.opponentPanel : self.watchersPanel
						
						targetPanel.addUser(user)
					
					})
			},
			
			contains : function(node){
			
				var isChild = false
				
				while(node){
					if(node === this.containerNode){
						isChild = true
						break
					}
					node = node.parentNode
				}
				
				return isChild
			},
			
			initUi : function(){
				this.hostPanel  = new UserPanelWidget({"header" : "Host", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				this.opponentPanel  = new UserPanelWidget({"header" : "Opponent", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				this.watchersPanel  = new UserPanelWidget({"header" : "Spectators", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				
				this.hostPanel.placeAt(this.containerNode)
				this.opponentPanel.placeAt(this.containerNode)
				this.watchersPanel.placeAt(this.containerNode)
				
				this.hostPanel.setNumberPainted(false)
				this.opponentPanel.setNumberPainted(false)
			},
			
        })
})