define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/SmileyWidget.html",
		"dojo/query"
		],
    function(declare, _WidgetBase, _TemplatedMixin, template, query){
	
        return declare("SmileyWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			smileyNodes : null,
			
			postCreate : function(){
				this.smileyNodes = query("img", this.containerNode)
			}
		
        });
		 
});