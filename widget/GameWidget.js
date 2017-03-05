define(["dojo/_base/declare",
		"dojo/on",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/GameWidget.html",
		"dojo/dom-style",
		"dojo/dom-geometry",
		"dojo/dom-attr",
		"dojo/_base/window",
		"/widget/GameInfoWidget.js",],
    function(declare, on, _WidgetBase, _TemplatedMixin, 
	template, domStyle, domGeom, domAttr, win, GameInfoWidget){
	
        return declare("GameWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			user: null,
			
			gameId: 0,
			
			users : [],
			
			state : "",
			
			title : "",
			
			description: "",
			
			numberOfUsers : 0,
			
			gameInfoWidget : null,
			
			lobbyWidget : null,
			
			postCreate: function(){
			
				this.gameInfoWidget = new GameInfoWidget({game : this, "lobbyWidget": this.lobbyWidget})
				this.gameInfoWidget.placeAt(win.body())
			
				this.addStyleHandlers()
			
				domAttr.set(this.gameNumberLabel, "innerHTML", "Game " + (this.gameId + 1))
				
				var self= this
				
				this.own(
				
					on(this.infoButton, "click", function(e){
				
						e.gameId = self.gameId + ""
						
						if(self.gameInfoWidget.isShowing()){
							self.gameInfoWidget.hide()
						}	
						else{
							var pos = domGeom.position(self.containerNode)
							self.gameInfoWidget.show(pos.x, pos.y)
						}						
								
					}),
				
					this.watch("title", function(attr, oldVal, newVal) {
						self.updateTitleLabel()
					}),
				
					this.watch("numberOfUsers", function(attr, oldVal, newVal) {
						self.updateButtons()
						self.updatePopLabel()
						
						if(newVal == 0){
							self.set("state", "free")  
							self.set("title", "")
						}
						if(newVal == 1){
							self.set("state", "waiting")  
							self.set("title", self.users[0].name + "'s Game")
						}

					}),
					
					this.watch("state", function(attr, oldVal, newVal) {
						self.updateButtons()
						
						if(newVal !== "free"){
							self.users.forEach(function(user){
								user.set("state", newVal)
							})
						}
					})
				)
		
			},
			
			addUser : function(user){
				
				this.users.push(user)
				
				this.set("numberOfUsers", this.users.length) 
				user.set("state", this.state)
				user.set("room", this.gameId)
				
			},
			
			removeUser : function(user){
				
				this.users.splice(this.users.indexOf(user), 1)
				
				this.set("numberOfUsers", this.users.length) 
				user.set("state", "looking")
				user.set("room", -1)
			},
			
			updateTitleLabel : function(){
				domAttr.set(this.titleLabel, "innerHTML", this.title)
			},
			
			updatePopLabel : function(){
				domAttr.set(this.popLabel, "innerHTML", this.users.length + "/8" )
			},
			
			localUserInside : function(){
			
				var result = false 
				
				this.users.forEach(function(u){
						
						if(u.name === this.user.name){
							result = true
						}
					}, this)
				
				return result
			},
			
			updateButtons : function(){
				
				// Info Button
				if(this.users.length === 0){
					domStyle.set(this.infoButton, "display", "none")
					domStyle.set(this.infoLabel, "display", "none")
				}
				else{
					domStyle.set(this.infoButton, "display", "block")
					domStyle.set(this.infoLabel, "display", "block")
				}

				// Interaction Button
				if(this.localUserInside()){
					domAttr.set(this.userInteractionLabel, "innerHTML", "Inside" )
					// domAttr.set(this.mainButton, "src","/widget/images/lobby/main_button_hover.png")
				}
				else{
					
					if(this.state === "free" ){
						domAttr.set(this.userInteractionLabel, "innerHTML", "Host" )
						domAttr.set(this.mainButton, "src","/widget/images/lobby/main_button.png")
					}
					if(this.state === "waiting" ){
						
						if(this.users.length === 8){
							domAttr.set(this.userInteractionLabel, "innerHTML", "Full" )
							domAttr.set(this.mainButton, "src","/widget/images/lobby/main_button_disabled.png")
						}
						else{
							domAttr.set(this.userInteractionLabel, "innerHTML", "Join" )
							domAttr.set(this.mainButton, "src","/widget/images/lobby/main_button_waiting.png")
						}
					}
					if(this.state === "playing" ){
						domAttr.set(this.mainButton, "src","/widget/images/lobby/main_button_disabled.png")
						if(this.users.length === 8){
							domAttr.set(this.userInteractionLabel, "innerHTML", "Full" )
						}
						else{
							domAttr.set(this.userInteractionLabel, "innerHTML", "Watch" )
						}
					}
				}
			},
			
			addStyleHandlers : function(){
			
				var self = this
				
				this.own( 
					on(this.mainButton, "mouseenter", function(){
					
						if(self.users.length === 8 || self.state === "playing") return
								
						var hoverIcon = self.state === "waiting" ? "/widget/images/lobby/main_button_waiting_hover.png" :
																		   "/widget/images/lobby/main_button_hover.png"
						domAttr.set(self.mainButton, "src", hoverIcon)
					}),
					
					on(this.mainButton, "mouseout", function(){
				
						if(self.users.length === 8 || self.state === "playing") return
								
						var icon = self.state === "waiting" ? "/widget/images/lobby/main_button_waiting.png" :
																		   "/widget/images/lobby/main_button.png"
						domAttr.set(self.mainButton, "src", icon)
					}),
					
					on(this.mainButton, "mousedown", function(){
								if(self.users.length === 8 || self.state === "playing") return
								
								var icon = self.state === "waiting" ? "/widget/images/lobby/main_button_waiting_pressed.png" :
																		   "/widget/images/lobby/main_button_pressed.png"
								domAttr.set(self.mainButton, "src", icon)
						   }),
						   
					on(this.mainButton, "mouseup", function(){
								if(self.users.length === 8 || self.state === "playing") return
								self.updateButtons()
						   }),
						   
					on(this.infoButton, "mouseover", function(){
								
								domAttr.set(self.infoButton, "src","/widget/images/lobby/info_button_hover.png")
						   }),
						   
					on(this.infoButton, "mouseout", function(){
								
								domAttr.set(self.infoButton, "src","/widget/images/lobby/info_button.png")
						   }),
						   
					on(this.infoButton, "mousedown", function(){
								
								domAttr.set(self.infoButton, "src","/widget/images/lobby/info_button_pressed.png")
						   }),
						   
					on(this.infoButton, "mouseup", function(){
								
								domAttr.set(self.infoButton, "src","/widget/images/lobby/info_button_hover.png")
						   })
				)
			}
        })
})