define([
    "dojo/_base/declare",
	"dojo/Evented",
	"/chess/Move.js"
], function(declare, Evented, Move){

    return declare("Board", Evented, {
	
		grid : null,
		
		idCounter : 0,
		
		colorToPlay : "White",
		
		takenPiece : null,
		
		lastMove : null,
	
		constructor: function(args){
            this.reset()
		},
		
		reset : function(){
			
			this.colorToPlay = "White"
			
			this.grid = new Array(8)
			for (var i = 0; i < 8; i++) {
                this.grid[i] = new Array(8)
                for (var j = 0; j < 8; j++) {
                    this.grid[i][j] = null
                }
            }
			
            this.grid [0][0] = new Rook({color: "Black", id : this.nextId()})
            this.grid [0][1] = new Knight({color: "Black", id : this.nextId()})
            this.grid [0][2] = new Bishop({color: "Black", id : this.nextId()})
            this.grid [0][3] = new Queen({color: "Black", id : this.nextId()})
            this.grid [0][4] = new King({color: "Black", id : this.nextId()})
            this.grid [0][5] = new Bishop({color: "Black", id : this.nextId()})
            this.grid [0][6] = new Knight({color: "Black", id : this.nextId()})
            this.grid [0][7] = new Rook({color: "Black", id : this.nextId()})
            for (var i = 0; i < 8; i++)
                this.grid [1][i] = new Pawn({color: "Black", id : this.nextId()})
            for (var i = 0; i < 8; i++)
                this.grid [6][i] = new Pawn({color: "White", id : this.nextId()})
            this.grid [7][0] = new Rook({color: "White", id : this.nextId()})
            this.grid [7][1] = new Knight({color: "White", id : this.nextId()})
            this.grid [7][2] = new Bishop({color: "White", id : this.nextId()})
            this.grid [7][3] = new Queen({color: "White", id : this.nextId()})
            this.grid [7][4] = new King({color: "White", id : this.nextId()})
            this.grid [7][5] = new Bishop({color: "White", id : this.nextId()})
            this.grid [7][6] = new Knight({color: "White", id : this.nextId()})
            this.grid [7][7] = new Rook({color: "White", id : this.nextId()})
		},
		
		tryMove: function(src, dst, localMove){
			
			var piece = this.getPieceAt(src)
			
			var rightColor = piece.color == this.colorToPlay 
			var dstIsSrc = src.row == dst.row && src.col == dst.col 
			var selfAttack = false;
			if( !this.isEmptyAt(dst) )
				selfAttack = this.getPieceAt(dst).color == piece.color

			if(dstIsSrc || selfAttack || !rightColor){
				return null;
			}
			
			if(piece.canMove(src, dst, this)){
				
				var move = new Move({"piece": piece, "src": src, "dst": dst, "isAmbiguious": this.ambiguiousMove(src, dst, piece.color)})

				if(this.getPieceAt(dst) != null){
					move.isExchange = true
					move.takenPiece = this.getPieceAt(dst)
				}

				// en passant
				if(piece instanceof Pawn && Math.abs(src.col - dst.col) == 1 && this.isEmptyAt(dst))
					move.IsEnPassant = true

				// castle
				if(piece instanceof King && (Math.abs(src.col - dst.col) == 2 ))
					move.isCastle = true
				
				this.movePiece(src, dst)
				
				if(this.isChecked(piece.color)){
					this.rollBack(src, dst)
					return null
				}
				
				// Pawn promotion
            	if(piece instanceof Pawn && (dst.row == 0 || dst.row == 7)){
					move.isPromotion = true
					var promotionPiece = new Queen({color: piece.color, id : this.nextId()})
					this.setPieceAt(dst, promotionPiece)
					this.emit("piece added", {"piece" : promotionPiece})
				}
                   
				var opponentColor = this.complement(piece.color)
				
				if(this.isChecked(opponentColor)){
                     move.isCheck = true
                     if(this.isCheckMated(opponentColor)){
						move.isCheckMate = true
                     }
                 }
				
				// All actions performed if a valid move
				this.colorToPlay = this.complement(this.colorToPlay)
				this.lastPlayedMove = {"piece" : piece, "src" : src, "dst" : dst}
				piece.moved = true
				
				this.emit("state changed", {"move" : move, "isLocalMove": localMove})
			
			}
			
		},
	
		movePiece : function(src, dst){
			this.takenPiece = this.getPieceAt(dst)
			this.setPieceAt(dst, this.getPieceAt(src))
			this.setPieceAt(src, null)
		},
		
		rollBack : function(src, dst){
			this.setPieceAt(src, this.getPieceAt(dst));
			this.setPieceAt(dst, this.takenPiece);
		},
		
		getPieceAt : function(square){
			
			return this.grid [square.row][square.col]
		},
		
		setPieceAt : function(square, piece){
			this.grid [square.row][square.col] = piece
		},
		
		isEmptyBetween : function (src, dst){
			
			var dx
			if(src.col == dst.col)
				dx = 0
			else
				dx =(src.col < dst.col ? 1: -1)
			
			
			var dy
			if(src.row == dst.row)
				dy = 0
			else
				dy =(src.row < dst.row ? 1: -1)

			var x = src.col + dx
			var y = src.row + dy
			
			while( !( x == dst.col && y == dst.row) ){
				
				if (!this.isEmptyAt({"row": y, "col": x})){
					return false
				}
					
				x += dx
				y += dy
			}

			return true
		},
		
		isEmptyAt : function(square){
			 return this.grid[square.row][square.col] == null;
		},
		
		isChecked : function(color){

			var kingPosition  = this.getKingPosition(color)
			var opponentColor = this.complement(color)
			var piece
			var piecePosition

			for(var i = 0; i< 8; i++){
			
				for(var j = 0; j< 8; j++){
					
					piecePosition = {"row":i, "col" : j}
					piece = this.getPieceAt(piecePosition)
					
					if(piece && piece.color == opponentColor){

                        if(!(piece instanceof King) && piece.canMove(piecePosition, kingPosition, this) )
                             return true;
                                 
                    }
				}
			}

			return false;
		},
		
		isCheckMated : function(color){

			/* Algorithm: see if the king can escape the threat by
			 * moving. If he can't, two cases:
			 * The king is under a double threat : checkmate.
			 * Single threat : look for an ally piece that can take or get
			 * in the way of the threatening one. If none is found it's mate.
			 */

			var threats = []
			var opponentColor = this.complement(color);
			var kingPosition = this.getKingPosition(color);
			var dst;

			/* Check if the king can escape the threat by moving. */
			for(var i = -1; i<=1; i++){
			
				for(var j = -1; j<=1; j++){
					
					var y = kingPosition.row + j;
					var x = kingPosition.col + i;

					if( (i == 0 && j == 0) || x < 0 || x > 7 || y < 0 || y > 7)
						continue;

					dst = {"row" : y, "col": x}
					
					if(this.isEmptyAt(dst) || this.getPieceAt(dst).color !== color){
					
						this.movePiece(kingPosition, dst)
						
						if(this.isChecked(color)){
							this.rollBack(kingPosition, dst)
						}
						else{
							this.rollBack(kingPosition, dst)
							return false;
						}
					}
				}
			}
			
			/* Search for the threatening pieces.*/
			for(var i = 0; i< 8; i++){
			
				for(var j = 0; j< 8; j++){
				
					var threatPosition
					var sqr = {"row":i, "col" : j}
					var piece = this.getPieceAt(sqr)
					
					if(piece && piece.color == opponentColor){

						threatPosition = sqr
						
						if(piece.canMove(threatPosition, kingPosition, this)){
							threats.push(threatPosition)
						}
							
					}
				}
			}
				
			/* If single check*/
			if(threats.length == 1){

				var threat = threats.shift();

				for(var i = 0; i< 8; i++){
					
					for(var j = 0; j< 8; j++){

						
						var piecePosition = {"row":i, "col" : j}
						var piece = this.getPieceAt(piecePosition)

						 /* See if any piece can take the threatening one,
						  * without giving way to a new threat.*/
						
						if(piece && piece.color == color){

							  /*We already dealt with the king.*/
							  if(piece.canMove(piecePosition, threat, this) && !(piece instanceof King)){

								  this.movePiece(piecePosition, threat);

								  if(this.isChecked(color))
									   this.rollBack(piecePosition, threat);
								  else{
									  this.rollBack(piecePosition, threat);
									  return false;
								  }
												
							  }
									   

							/* See if any piece can get in the way of the threatening one
							 * and block the check, without giving way to a new threat.*/
							var threateningPiece = this.getPieceAt(threat)
							if(!(this.getPieceAt(threat) instanceof Knight) && !(piece instanceof Knight)){
								var dx;
								if(kingPosition.col == threat.col)
									dx = 0;
								else
								dx =(kingPosition.col< threat.col ? 1: -1);
		
								var dy;
								if(kingPosition.row == threat.row)
									dy = 0;
								else
									dy =(kingPosition.row< threat.row ? 1: -1);
		
								var x = kingPosition.col + dx;
								var y = kingPosition.row + dy;
		
								var inBetweenSquare;
								while( !( x == threat.col && y == threat.row) ){
		
									 inBetweenSquare = {"row":y, "col" : x}
		
									 if(piece.canMove(piecePosition, inBetweenSquare, this)){
		
										 this.movePiece(piecePosition, inBetweenSquare);
		
										   if(this.isChecked(color))
												this.rollBack(piecePosition, inBetweenSquare);
										   else{
												this.rollBack(piecePosition, inBetweenSquare);
												return false;
											   }
									 }
										 
									 x += dx;
									 y += dy;
								}
							}
						}
					 }
				}
					
			}
			
			return true;
		},
		
		getKingPosition : function(color){

			for(var i = 0; i< 8; i++){
			
				for(var j = 0; j< 8; j++){
				
					var square = {"row":i, "col" : j}
					var p = this.getPieceAt(square)
					
					if(p != null && p instanceof King && p.color == color)
						return square
				}
			}
				   
		   return null;
		},
		
		ambiguiousMove: function(src, dst, color){

			var ambiguious = false;
			var piece = this.getPieceAt(src);

			for(var i = 0; i < 8; i++){
				for(var j = 0; j<8; j++){

					var twinSrc = {"row" : i, "col" : j}
                    var twin = this.getPieceAt(twinSrc)
					
					if(twin && twin.getChessAlphaChar() == piece.getChessAlphaChar() && twin != piece){

							if(twin.canMove(twinSrc, dst, this)){
								this.movePiece(twinSrc, dst)

								if(!this.isChecked(twin.color))
									ambiguious = true

								this.rollBack(twinSrc, dst)
							}

						}
				}
			}
					
			return ambiguious;
		},
		
		complement : function(color){
			return color == "White" ? "Black" : "White"
		},
		
		nextId : function(){
			return "" + this.idCounter++
		},
		
		dump: function(){
		
			var output = ""
			
			for (var i = 0; i < 8; i++) {
			
				var line = ""
                
                for (var j = 0; j < 8; j++) {
				
                    var piece = this.grid[i][j]
					
					if(piece == null){
						line += "xx "
					}
					else{
						line += piece.getCode() + " "
					}
                }
				
				output += line + "\n"
            }
			
			console.log(output)
		}
    })
})