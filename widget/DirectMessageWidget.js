define(["dojo/_base/declare",
		"dojo/on",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/DirectMessageWidget.html",
		"dojo/dom-style",
		"/widget/ChatWidget.js",],
    function(declare, on, _WidgetBase, _TemplatedMixin,
	template, domStyle, ChatWidget){

        return declare("DirectMessageWidget",[_WidgetBase, _TemplatedMixin], {

            templateString: template,

			chatWidget : null,

			socket: null,

			username : null,

			toUsername : null,

			startup : function(){

				this.chatWidget = new ChatWidget().placeAt(this.chatContainer)
				domStyle.set(this.chatWidget.containerNode , "width", "98%")
				domStyle.set(this.chatWidget.containerNode , "height", "99%")

				var self = this
				this.own(on(this.chatWidget.sendButton, "click", function(){

					if(self.chatWidget.chatField.value){
						self.socket.emit('private chat', self.toUsername, self.chatWidget.chatField.value)
						self.chatWidget.insertChat("<" + self.username + "> " + self.chatWidget.chatField.value,"black")
						self.chatWidget.chatField.value = ""

					}
				}))
			},

        });
});
