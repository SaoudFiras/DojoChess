define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/UserInfoWidget.html",
		"dojo/dom-style",
		"dojo/dom-construct",
		"dojo/dom-attr",
		"dojo/string"],
    function(declare, _WidgetBase, _TemplatedMixin, 
	template, domStyle, domCons, domAttr, string){
	
        return declare("UserInfoWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			user: null,
			
			countryToCode : {"Bulgaria":"bg","Germany":"de","Netherlands":"nl","Norway":"no",
							"Russia":"ru","Unknown":"unknown","United States":"us" ,"Denmark":"dk"},
			
			nameAndFlagDomStr : "<table cellspacing='1' style='width:100%'>" + 
								"<tr>" +
								"<td> ${name} </td>" + 
								"<td><img style='margin-top: 2px' src='/widget/images/flags/${country}.png'> </img> </td>" +
								"</tr>" +
								"</table>",
			
			show : function(x, y){
			
				domCons.empty(this.nameAndFlagContainer);
				
				var userTable = domCons.toDom(string.substitute(this.nameAndFlagDomStr, { name: this.user.name, country: this.countryToCode[this.user.country] }));
				domCons.place(userTable, this.nameAndFlagContainer);
				
				domAttr.set(this.stateContainer, "innerHTML", this.user.state === "looking" ? "Looking" :
															  this.user.state[0].toUpperCase() + this.user.state.slice(1)  + " in Game " + (this.user.room+1))
				domAttr.set(this.countryContainer, "innerHTML", this.user.country);
				domAttr.set(this.ratingContainer, "innerHTML", this.user.rating);
				domAttr.set(this.winsContainer, "innerHTML", this.user.wins);
				domAttr.set(this.lossesContainer, "innerHTML", this.user.losses);
				domAttr.set(this.drawsContainer, "innerHTML", this.user.draws);
				
				domStyle.set(this.containerNode, "top", y + "px");
				domStyle.set(this.containerNode, "left", x + "px");
				domStyle.set(this.containerNode, "display", "block");
			},
			
			hide : function(){
				domStyle.set(this.containerNode, "display", "none");
			},
			
        });
});