define([
    "dojo/_base/declare",
	"/chess/piece/Piece.js",
], function(declare, Piece) {

    return declare("King", Piece, {
	
		pgnChar : "K",
	
		getImage : function(){
			return "/widget/images/" + this.color + "King.gif"
		},
		
		canMove : function(src, dst, board){
		
			/* If requesting to castle.*/
        if(Math.abs(src.col - dst.col) === 2 && src.row === dst.row
              && !board.isChecked(this.color) && !this.moved){

				if(!board.isEmptyBetween(src, dst)){
					return false
				}
                
				var myRook = null
				var rookPosition = null
				var inBetween = null

				/* White castle Queen side*/
				if( dst.col === 2 && dst.row === 7 ){
					inBetween = {"row" : 7, "col" : 3}
					rookPosition = {"row" : 7, "col" : 0}
				}
				
				/* White castle king side.*/
				if( dst.col === 6 && dst.row === 7 ){
					inBetween = {"row" : 7, "col" : 5}
					rookPosition = {"row" : 7, "col" : 7}
				}

				/* Black castle Queen side.*/
				if( dst.col === 2 && dst.row === 0 ){
					inBetween = {"row" : 0, "col" : 3}
					rookPosition = {"row" : 0, "col" : 0}
				}

				/* Black castle king side.*/
				if( dst.col === 6 && dst.row === 0 ){
					inBetween = {"row" : 0, "col" : 5}
					rookPosition = {"row" : 0, "col" : 7}
				}

				if(rookPosition == null){
					return false
				}

				/* The rook of varerest must not have been played.*/
				myRook = board.getPieceAt(rookPosition);
				if(myRook.moved){
					 return false
			    }
                 
				/*The in between square should not be under control.*/
				var opponentColor = board.complement(this.color);
				var enemyPiece = null;
				var square;

				for (var i = 0; i<7; i++){
				
					for(var j = 0; j<7; j++){

						square = {"row" : i, "col" : j}
						enemyPiece = board.getPieceAt(square)
						
						if(enemyPiece && enemyPiece.color === opponentColor)
							if(enemyPiece.canMove(square, inBetween, board) ||
							   enemyPiece.canMove(square, dst, board)){
								
								return false
							}
					}	
				}
                
				// bad design! a harmless looking boolean function should not have side effects
				/* Move the rook.*/
				board.movePiece(rookPosition, inBetween);
				return true
			}
			
			var dx = dst.col - src.col
			var dy = dst.row - src.row

			var singleSquareMoevement = (Math.sqrt( (dx*dx) + (dy*dy) ) <= Math.sqrt(2))

			return singleSquareMoevement
		},
		
		getChessAlphaChar : function(){
			return this.color === "White" ? "n" : "N"
		},
		
		getCode : function(){
			return this.color.toLowerCase().charAt(0) + "K"
		}
    })
})