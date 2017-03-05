define(["dojo/_base/declare",
		"dojo/on",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/UserPanelWidget.html",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/query",
		"dojo/dom-attr",
		"/widget/UserWidget.js"],
    function(declare, on, _WidgetBase, _TemplatedMixin, 
	template, domStyle, domCons, query, domAttr, UserWidget){
	
        return declare("UserPanelWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			color: "white",
			
			header: "",
			
			trackUserCount : true,
			
			lobbyWidget : null,
			
			userCount : 0,
			
			userToWidget : {},
			
			postCreate : function(){
			
				this.addStyleHandlers()
				
				domAttr.set(this.headerNode, "innerHTML" , this.header)
				
				if(this.trackUserCount){
				
					var self = this
					this.watch("userCount", function(attr, oldVal, newVal){
						
						self.setPaintedNumberOfUsers(newVal)
						
						domStyle.set(self.containerNode, "display", newVal == 0 ? "none" : "block")
					})
				}
				else{
					domStyle.set(this.containerNode, "display", "block")
				}
				
				this.watch("color", function(attr, oldVal, newVal){
					query("table", this.containerNode).forEach(function(table){
						domStyle.set(table, "color", newVal)
					})
				})
				
			},
			
			addUser : function(user){
				// console.log("adding " + user.name + " " + this.header)
				var widget = new UserWidget({"user": user, "color": this.color, "lobbyWidget": this.lobbyWidget})
				widget.placeAt(this.userContainer)
				this.userToWidget[user.name] = widget
				this.set("userCount", this.userCount + 1)
			},
			
			removeUser : function(user){
				// console.log("removing " + user.name + " " + this.header)
				var w = this.userToWidget[user.name] 
				delete this.userToWidget[user.name] 
				this.set("userCount", this.userCount - 1)
				w.destroyRecursive()
				
			},

			reset : function(){
				this.set("userCount", 0) 
				this.userToWidget = {}
				domCons.empty(this.userContainer)
			},
			
			setPaintedNumberOfUsers : function(numberOfUsers){
				domAttr.set(this.numberNode, "innerHTML" , "(" + numberOfUsers + ")")
			},
			
			setNumberPainted : function(bool){
				var display = bool ? "block" : "none"
				domStyle.set(this.numberNode, "display", display)
			},
			
			addStyleHandlers: function(){
			
				var self = this
				
				on(this.arrowNode, "click", function(){
							domStyle.set(self.userContainer, "display", domStyle.get(self.userContainer, "display") === "block" ? "none" : "block");
					})
			}
			
        });
});