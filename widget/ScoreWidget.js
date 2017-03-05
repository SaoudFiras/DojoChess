define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/ScoreWidget.html",
		"dojo/dom-style",
		"dojo/query",
		"dojo/dom-attr",],
    function(declare, _WidgetBase, _TemplatedMixin, template,
	domStyle, query, domAttr){
	
        return declare("ScoreWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			pieceCollector : null,
			
			startup : function(){
				query(".hideable").forEach(function(node){
					domStyle.set(node, "display", "none")
				})
			},
			
			setWhiteName : function(name){
				domAttr.set(this.whiteName, "innerHTML", name)
			},
			
			setWhiteRating : function(rating){
				domAttr.set(this.whiteRating, "innerHTML", rating)
			},
			
			setBlackName : function(name){
				domAttr.set(this.blackName, "innerHTML", name)
			},
			
			setBlackRating : function(rating){
				domAttr.set(this.blackRating, "innerHTML", rating)
			},
			
			clearUsers : function(){
			
				domAttr.set(this.whiteName, "innerHTML", "")
				domAttr.set(this.blackName, "innerHTML", "")
				domAttr.set(this.whiteRating, "innerHTML", "")
				domAttr.set(this.blackRating, "innerHTML", "")
			},
			
			collect : function(piece){
				this.getPieceCollector().collect(piece)
			},
			
			reset : function(){
				this.getPieceCollector().reset()
				this.clearCapturedPieces()
			},
			
			clearCapturedPieces : function(){
			
				query(".hideable").forEach(function(node){
					domStyle.set(node, "display", "none")
				})
			},
			
			updateCapturedPieces : function(){
			
				var pieceCollector = this.getPieceCollector()
				this.clearCapturedPieces()
				
				var diff = pieceCollector.blackPawnsNumber - pieceCollector.whitePawnsNumber
				
				if(diff > 0){
				
					domStyle.set(this.blackPawnsLabel, "display", "block")
					
					if(diff > 1){
						domStyle.set(this.blackPawnsNumber, "display", "block")
						domAttr.set(this.blackPawnsNumber, "innerHTML", diff)
					}
					
				}
				else if(diff < 0){
				
					domStyle.set(this.whitePawnsLabel, "display", "block")
					
					if(diff < -1){
						domStyle.set(this.whitePawnsNumber, "display", "block")
						domAttr.set(this.whitePawnsNumber, "innerHTML", Math.abs(diff))
					}
				}
				
				var diff = pieceCollector.blackPawnsNumber - pieceCollector.whitePawnsNumber
				
				if(diff > 0){
				
					domStyle.set(this.blackPawnsLabel, "display", "block")
					
					if(diff > 1){
						domStyle.set(this.blackPawnsNumber, "display", "block")
						domAttr.set(this.blackPawnsNumber, "innerHTML", diff)
					}
					
				}
				else if(diff < 0){
				
					domStyle.set(this.whitePawnsLabel, "display", "block")
					
					if(diff < -1){
						domStyle.set(this.whitePawnsNumber, "display", "block")
						domAttr.set(this.whitePawnsNumber, "innerHTML", Math.abs(diff))
					}
				}
				
				diff = pieceCollector.blackKnightsNumber - pieceCollector.whiteKnightsNumber
				
				if(diff > 0){
				
					domStyle.set(this.blackKnightsLabel, "display", "block")
					
					if(diff > 1){
						domStyle.set(this.blackKnightsNumber, "display", "block")
						domAttr.set(this.blackKnightsNumber, "innerHTML", diff)
					}
					
				}
				else if(diff < 0){
				
					domStyle.set(this.whiteKnightsLabel, "display", "block")
					
					if(diff < -1){
						domStyle.set(this.whiteKnightsNumber, "display", "block")
						domAttr.set(this.whiteKnightsNumber, "innerHTML", Math.abs(diff))
					}
				}
				
				diff = pieceCollector.blackBishopsNumber - pieceCollector.whiteBishopsNumber
				
				if(diff > 0){
				
					domStyle.set(this.blackBishopsLabel, "display", "block")
					
					if(diff > 1){
						domStyle.set(this.blackBishopsNumber, "display", "block")
						domAttr.set(this.blackBishopsNumber, "innerHTML", diff)
					}
					
				}
				else if(diff < 0){
				
					domStyle.set(this.whiteBishopsLabel, "display", "block")
					
					if(diff < -1){
						domStyle.set(this.whiteBishopsNumber, "display", "block")
						domAttr.set(this.whiteBishopsNumber, "innerHTML", Math.abs(diff))
					}
				}
				
				diff = pieceCollector.blackRooksNumber - pieceCollector.whiteRooksNumber
				
				if(diff > 0){
				
					domStyle.set(this.blackRooksLabel, "display", "block")
					
					if(diff > 1){
						domStyle.set(this.blackRooksNumber, "display", "block")
						domAttr.set(this.blackRooksNumber, "innerHTML", diff)
					}
					
				}
				else if(diff < 0){
				
					domStyle.set(this.whiteRooksLabel, "display", "block")
					
					if(diff < -1){
						domStyle.set(this.whiteRooksNumber, "display", "block")
						domAttr.set(this.whiteRooksNumber, "innerHTML", Math.abs(diff))
					}
				}
				
				if(pieceCollector.whiteQueenCaptured ){
				
					if(!pieceCollector.blackQueenCaptured){
						domStyle.set(this.whiteQueenLabel, "display", "block")
					}
					
				}
				else{
				
					if(pieceCollector.blackQueenCaptured){
						domStyle.set(this.blackQueenLabel, "display", "block")
					}
				}
				
			},
			
			getPieceCollector : function(){
				if (!this.pieceCollector){
					this.pieceCollector = { 
					
						blackPawnsNumber : 0,
						
						blackKnightsNumber : 0,
						
						blackBishopsNumber : 0,
						
						blackRooksNumber : 0,
						
						blackQueenCaptured : false,
						
						whitePawnsNumber : 0,
						
						whiteKnightsNumber : 0,
						
						whiteBishopsNumber : 0,
						
						whiteRooksNumber : 0,
						
						whiteQueenCaptured : false,
						
						collect : function(piece){
							
							if(piece instanceof Pawn){
							
								if(piece.color === "White"){
									this.whitePawnsNumber++
								}
								else{
									this.blackPawnsNumber++
								}
							}
							
							if(piece instanceof Knight){
							
								if(piece.color === "White"){
									this.whiteKnightsNumber++
								}
								else{
									this.blackKnightsNumber++
								}
								
							}
							
							if(piece instanceof Bishop){
							
								if(piece.color === "White"){
									this.whiteBishopsNumber++
								}
								else{
									this.blackBishopsNumber++
								}
								
							}
							
							if(piece instanceof Rook){
								if(piece.color === "White"){
									this.whiteRooksNumber++
								}
								else{
									this.blackRooksNumber++
								}
								
							}
							
							if(piece instanceof Queen){
								if(piece.color === "White"){
									this.whiteQueenCaptured = true
								}
								else{
									this.blackQueenCaptured = true 
								}
							}
						},
						
						reset : function(){
							this.blackPawnsNumber = 0
							this.blackKnightsNumber = 0
							this.blackBishopsNumber = 0
							this.blackRooksNumber = 0
							this.blackQueenCaptured = false
							this.whitePawnsNumber = 0
							this.whiteKnightsNumber = 0	
							this.whiteBishopsNumber = 0	
							this.whiteRooksNumber = 0
							this.whiteQueenCaptured = false
						},
					}
				}
				
				return this.pieceCollector
			},
			
			
        });
});