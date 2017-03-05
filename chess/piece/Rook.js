define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("Rook", Piece, {
	
		pgnChar : "R",
	
		getImage : function(){
			return "/widget/images/" + this.color + "Rook.gif"
		},
		
		canMove : function(src, dst, board){
			
			var horizontalMovement = src.row === dst.row
			var verticalMovement = src.col === dst.col
			
			return (horizontalMovement || verticalMovement) && board.isEmptyBetween(src, dst)
		},
		
		getChessAlphaChar : function(){
			return this.color === "White" ? "l" : "L"
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "R"
		}
    })
})