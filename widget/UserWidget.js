define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/UserWidget.html",
		"dojo/on",
		"dojo/dom-construct",
		"dojo/dom-geometry",
		"dojo/dom-attr",
		"/widget/UserInfoWidget.js",
		"dijit/Dialog",],
    function(declare, _WidgetBase, _TemplatedMixin, template, on, domCons, domGeom, domAttr, UserInfoWidget, Dialog){
	
        return declare("UserWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			userInfoWidget : null,
			
			color: null,
			
			user : null,
			
			lobbyWidget : null,
			
			postCreate : function(){
				
				var self = this;
						   
				this.own( on(this.containerNode, "mouseenter", function(e){
								
								if(self.userInfoWidget === null){
									self.userInfoWidget = new UserInfoWidget({"user": self.user})
									self.userInfoWidget.placeAt(self.containerNode.parentNode)
								}
				
								var x = (e.pageX - domGeom.position(self.containerNode.parentNode).x)
								var y = (domGeom.position(self.containerNode).y - domGeom.position(self.containerNode.parentNode).y + domGeom.position(self.containerNode).h)
								self.userInfoWidget.show(x , y)
								
						   }),
						   
						   on(this.containerNode, "mouseleave", function(){
								self.userInfoWidget.hide()
						   }),
						   
						   on(this.containerNode, "click", function(){
								
								if(self.user != self.lobbyWidget.user && !self.lobbyWidget.dmWidgets[self.user.name]){
									var dmWidget = new DirectMessageWidget({"socket": self.lobbyWidget.socket, "toUsername":self.user.name,
																			"username": self.lobbyWidget.user.name})
									self.lobbyWidget.dmWidgets[self.user.name] = dmWidget
									
									var d = new Dialog({ title : "Dojo Chess - Conversation",
														 content: dmWidget,
														 baseClass: 'dijitContentPaneNoPadding',
														 class:'nonModal'
														})	
														
									on(d, "hide", function(){
										
										delete self.lobbyWidget.dmWidgets[self.user.name] 
												
									 })
									 
									d.show()
								}
							
						   }))
						
				this.user.watch("rating", function(attr, oldVal, newVal){
					domAttr.set(self.ratingLabel, "innerHTML", newVal)
				})
			},
			
			destroy : function(){
				
				if(this.userInfoWidget){	
					domCons.destroy(this.userInfoWidget.containerNode)
				}
				domCons.destroy(this.containerNode)
				
				this.inherited(arguments)
			}
        });
});