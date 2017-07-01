define(["dojo/_base/declare",
		"dojo/on",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/ChatWidget.html",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/dom-geometry",
		"dojo/dom-attr",
		"dojo/regexp",
		"dojox/html/entities",
		"dojo/_base/window",
		"/widget/SmileyWidget.js"],
    function(declare, on, _WidgetBase, _TemplatedMixin,
	template, domStyle, domCons, domGeom, domAttr, regexp, html, win, SmileyWidget){

        return declare("ChatWidget",[_WidgetBase, _TemplatedMixin], {

        templateString: template,

				chatAreaHeight : 65,

				smileyWidget : null,

				smileyLiteralToImg : {},

				postCreate : function(){

				this.smileyWidget = new SmileyWidget()
				this.smileyWidget.placeAt(this.containerNode)

				var self = this

				this.own( on(this.smileyButton, "click", function(e){

								if(domStyle.get(self.smileyWidget.containerNode, "display") === "none" ){

									domStyle.set(self.smileyWidget.containerNode, "display", "block")

									var top = domGeom.position(self.smileyButton).y - domGeom.position(self.containerNode).y - 160
									domStyle.set(self.smileyWidget.containerNode, "top", top + "px")

									e.stopPropagation();

									var handle = on(win.body(), "click", function(e){

																domStyle.set(self.smileyWidget.containerNode, "display", "none");
																handle.remove();
													})
								}

							})
				)

				this.smileyWidget.smileyNodes.forEach(function(smileyNode){

					self.smileyLiteralToImg[domAttr.get(smileyNode, "alt")] = domAttr.get(smileyNode, "src");
					self.own(on(smileyNode, "click", function(){
									self.chatField.value += " " + domAttr.get(smileyNode, "alt");
									self.chatField.focus();
								}))
				});

				this.own(on(this.chatField, "keypress", function(e){

					if (e.keyCode == 13) {
						self.sendButton.click();
					}
				}))
			},

			startup: function(){
				domStyle.set(this.chatArea, "maxHeight", domStyle.get(this.chatArea, "height") + "px")
			},

			isChildOfSmileyWidget : function(node){

				var isChild = false;
				while(node){
					if(node === this.smileyWidget.containerNode){
						isChild = true;
						break;
					}
					node = node.parentNode;
				}

				return isChild;
			},

			insertChat: function(msg, colorString){

				// Append a harmless white space so the test below finds smilies at the end of the message
				msg += " ";
				msg = html.encode(msg);

				for (var smiley in this.smileyLiteralToImg) {

					if(msg.indexOf(smiley + " ") !== -1){

						var smileyTag = "<img alt='" + smiley + "' src='" + this.smileyLiteralToImg[smiley] + "'/> ";
						msg = msg.replace(new RegExp(regexp.escapeString(smiley) + " ","g"), smileyTag);

					}
				}

				if(colorString === "black"){
					var username = msg.substring(0, msg.indexOf("&gt;")+4)
					console.log("username", username)
					// var rest = html.encode(msg.substring(msg.indexOf("&gt")+3))
					var rest = msg.substring(msg.indexOf("&gt;")+4);
					domCons.create("strong", { innerHTML: username, style:{color: colorString}}, this.chatArea)
					domCons.create("span", { innerHTML: rest, style:{color: colorString}}, this.chatArea)
				}
				else{
					domCons.create("span", { innerHTML: msg, style:{color: colorString}}, this.chatArea)
				}

				domCons.create("br", null, this.chatArea)
				this.chatArea.scrollTop = this.chatArea.scrollHeight

			}

        });
});
