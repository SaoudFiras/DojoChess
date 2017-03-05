define([
    "dojo/_base/declare",
], function(declare) {

    return declare("Piece", null, {
	
		id : 0,
		
		color: "",
		
		moved : false,
	
		constructor: function(args){
			declare.safeMixin(this,args);
		},

    })
})