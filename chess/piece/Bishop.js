define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("Bishop", Piece, {
	
		pgnChar : "B",
		
		getImage : function(){
			return "/widget/images/" + this.color + "Bishop.gif"
		},
		
		canMove : function(src, dst, board){
			
			var diagonalMovement = Math.abs(dst.row - src.row) === Math.abs(dst.col - src.col)
			
			return diagonalMovement && board.isEmptyBetween(src, dst)
		},
		
		getChessAlphaChar : function(){
			return this.color === "White" ? "j" : "J"
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "B"
		}
    })
})