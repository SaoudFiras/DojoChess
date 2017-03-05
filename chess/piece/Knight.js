define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("Knight", Piece, {
	
		pgnChar : "N",
		
		getImage : function(){
			return "/widget/images/" + this.color + "Knight.gif"
		},
		
		canMove : function(src, dst, board){
			
			var dx = dst.col - src.col;
			var dy = dst.row - src.row;

			return (Math.sqrt( (dx*dx) + (dy*dy) ) === Math.sqrt(5))
		},
		
		getChessAlphaChar : function(){
			return this.color === "White" ? "k" : "K"
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "N"
		}
    })
})