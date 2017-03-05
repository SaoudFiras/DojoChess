define([
    "dojo/_base/declare",
], function(declare) {

    return declare("PgnParser", null, {
	
		columns : {"a" : 0, "b" : 1, "c" : 2, "d" : 3, "e" : 4, "f" : 5, "g" : 6, "h" : 7},
		
		rows : [0,7,6,5,4,3,2,1,0],
	
		parse : function(data){
		
			var movesBlock
			data.split("\n").forEach(function(line){
				
				if(line.length > 0 && line.charAt(0) !== "[" && line.charCodeAt(0) != 13){
					
					movesBlock += line + " "
				}
			})
		
			var moveLiterals = []
			movesBlock.trim().split(".").forEach(function(str){
				
				if(str.indexOf(" ") !== -1){
				
					str = str.trim()
					str = str.substring(0,str.lastIndexOf(" "))
					
					str.split(" ").forEach(function(literal){
					
						moveLiterals.push(literal)
					})
				}
			})
			
			var board = new Board()
			var moves = []
			
			moveLiterals.forEach(function(literal, index){
				
				var lastChar = literal.charAt(literal.length-1)
				if(lastChar == "+" || lastChar == "#"){
					literal = literal.substring(0, literal.length -1)
				}
					
				var color = (index%2 == 0) ? "White": "Black"
				var source = null
				var target = null
				var piece
				var y
				var step
				var pgnChar
			
				switch(literal.length){
				
					case 2:
					
						var col = this.columns[literal.substring(0, 1)]
						var row = this.rows[parseInt(literal.substring(1))]
						
						target = {"row" : row, "col" : col}

						y = color == "White" ? 0 : 7
						step = color == "White" ? 1 : -1

						do{
							var sqr = {"row" : y, "col" : col}
							piece = board.getPieceAt(sqr);

							if( piece && piece instanceof Pawn && piece.color == color){
									source = sqr;
									break
							}
							
							y += step;
							
						}while( y >=0 && y <= 7);
						
						break;
						
					case 3:
					
						// castle King side
						if(literal == "O-O"){
							if(color == "White"){
								source = {"row" : 7, "col" : 4}
								target = {"row" : 7, "col" : 6}
							}
							else{
								source = {"row" : 0, "col" : 4}
								target = {"row" : 0, "col" : 6}
							}
							
							piece = board.getPieceAt(source);
							break
						}

						pgnChar = literal.substring(0, 1)
						col = this.columns[literal.substring(1, 2)]
						row = this.rows[parseInt(literal.substring(2))]
						target = {"row" : row, "col" : col}

						for(var a=0; a <=7; a++){
							for(var b =0; b <=7; b++){

								var sqr = {"row" : b, "col" : a}

								piece = board.getPieceAt(sqr)

								if(piece && piece.pgnChar == pgnChar && piece.color == color && piece.canMove(sqr, target, board)){
										
									board.movePiece(sqr, target)
									if(board.isChecked(color)){
										board.rollBack(sqr, target);
										continue;
									}
									else{
										board.rollBack(sqr, target);
										source = sqr;
										a = 9
										b = 9		
									}				
								}	
							}
						}
							
						break
						
					case 4:
						col = this.columns[literal.substring(2, 3)]
						row = this.rows[parseInt(literal.substring(3))]
						target = {"row" : row, "col" : col}

						// exchange
						if( literal.indexOf("x") != -1){
						
							if("BKNQR".indexOf(literal.substring(0, 1)) != -1){
							
								pgnChar = literal.substring(0, 1)

								for(var a =0; a <=7; a++){
									for(var b =0; b <=7; b++){

										var sqr = {"row" : b, "col" : a}

										piece = board.getPieceAt(sqr)
										
										if(piece && piece.pgnChar == pgnChar && piece.color == color && piece.canMove(sqr, target, board)){
										
											board.movePiece(sqr, target)
											if(board.isChecked(color)){
												board.rollBack(sqr, target)
												continue
											}
											else{
												board.rollBack(sqr, target)
												source = sqr
												
												a = 9
												b = 9
											}
										}
									}
								}
							}
							else{
								// the taker is a Pawn
								y = (color == "White" ? 0: 7);
								step = (color == "White" ? 1: -1);

								do{
									var sqr = {"row" : y, "col" : this.columns[literal.substring(0, 1)]}
									
									piece = board.getPieceAt(sqr);

									if(piece instanceof Pawn && piece.color == color){
										source = sqr;
										y = 100;
									}

									 y += step;

								}while( y >=0 && y <= 7);
							}
						}

						// ambiguous move
						else{
							
							var x = this.columns[literal.substring(1, 2)]
							pgnChar = literal.substring(0, 1)

							for(var k = 0; k <= 7; k++){
								var sqr = {"row" : k, "col" : x}

								piece = board.getPieceAt(sqr)
								
								if(piece && piece.color == color && piece.pgnChar == pgnChar ){
									source = sqr;
									k = 10;
								}	
							}
						}
						break
						Nbxd5
					case 5:
						// castle Queen side
						if(literal == "O-O-O"){
							if(color == "White"){
								source = {"row" : 7, "col" : 4}
								target = {"row" : 7, "col" : 2}
							}
							else{
								source = {"row" : 0, "col" : 4}
								target = {"row" : 0, "col" : 2}
							}
							piece = board.getPieceAt(source)
							
							break;
						}

						if(literal.indexOf("x") != -1){
							
							pgnChar = literal.substring(2, 3)
							col = this.columns[literal.substring(3, 4)]
							row = this.rows[parseInt(literal.substring(4))]
							target = {"row" : row, "col" : col}
							var x = this.columns[literal.substring(1, 2)]
							pgnChar = literal.substring(0, 1)
							
							for(var k = 0; k <= 7; k++){
								var sqr = {"row" : k, "col" : x}

								piece = board.getPieceAt(sqr)
								
								if(piece && piece.color == color && piece.pgnChar == pgnChar ){
									source = sqr;
									k = 10;
								}	
							}
						}
					break
					
					default:
					 break
				}
				
				moves.push({"src" : source, "dst" : target})
				
				if(piece.canMove(source, target, board))
					board.movePiece(source, target)
			
			}, this)
			
			return moves
		}

    })
})