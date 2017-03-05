define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("Pawn", Piece, {
		
		getImage : function(){
			return "/widget/images/" + this.color + "Pawn.gif"
		},
		
		canMove : function(src, dst, board){
			
			var step = this.color === "White" ? -1 : 1
			
			var oneSquareMove = src.col === dst.col && dst.row - src.row === step
			
			var twoSquareMove = src.col === dst.col &&
                ( (src.row === 6 || src.row === 1) && dst.row - src.row === (2 * step) )
				
			var attackMove = Math.abs(src.col - dst.col) == 1 && dst.row - src.row == step
			
			/* En passant*/
			if( attackMove && (src.row == 3 && this.color === "White")
						   || (src.row == 4 && this.color === "Black") ){

				if(board.lastPlayedMove){
				
					var lastPlayedPiece = board.lastPlayedMove.piece
					var src = board.lastPlayedMove.src
					var trg = board.lastPlayedMove.dst

					if(lastPlayedPiece instanceof Pawn && Math.abs(src.row - trg.row) == 2
						&& dst.col == src.col){

						board.movePiece(src, dst);
						board.setPieceAt(trg, null);

						if(board.isChecked(this.color)){
							board.rollBack(src, dst);
							board.setPieceAt(trg, lastPlayedPiece);
						}
						else{
							board.rollBack(src, dst);
							return true;
						}
					}
				}
			}
			
			return ( (board.isEmptyAt(dst) && ( oneSquareMove ||(twoSquareMove && board.isEmptyBetween(src, dst))))
                 || (attackMove && !board.isEmptyAt(dst)) )
				 
		},
		
		getChessAlphaChar : function(){
			return ""
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "P"
		}
    })
})