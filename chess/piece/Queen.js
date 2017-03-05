define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("Queen", Piece, {
	
		pgnChar : "Q",
		
		getImage : function(){
			return "/widget/images/" + this.color + "Queen.gif"
		},
		
		canMove : function(src, dst, board){
			
			var horizontalMovement = src.row === dst.row
			var verticalMovement = src.col === dst.col
			var diagonalMovement = Math.abs(dst.row - src.row) === Math.abs(dst.col - src.col)
			
			return ((horizontalMovement || verticalMovement || diagonalMovement)) && board.isEmptyBetween(src, dst)
		},
		
		getChessAlphaChar : function(){
			return this.color === "White" ? "m" : "M"
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "Q"
		}
    })
})