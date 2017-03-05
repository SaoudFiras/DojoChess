define([
    "dojo/_base/declare",
    "dojo/dom",
	"dojo/query",
    "dojo/dom-attr",
    "dojo/dnd/Moveable",
    "dojo/dom-construct",
    "dojo/fx",
    "dojo/dom-style",
	"dojo/on",
    "dijit/_WidgetBase",
	"/chess/piece/Pawn.js",
	"/chess/piece/King.js",
	"/chess/piece/Bishop.js",
	"/chess/piece/Rook.js",
	"/chess/piece/Queen.js",
	"/chess/piece/Knight.js",
	"/chess/Board.js",],

	function(declare, dom, query, domAttr, Moveable, domCons, fx, domStyle, on, _WidgetBase) {

    return declare("ChessBoard", [_WidgetBase], {
	
        margin: 25,
		
        squareWidth: 45,
		
        squareHorizontalMargin: 2,
		
        squareVerticalMargin: 3,
		
		board:null,
		
		pieces : [],
		
        lastMove: null,
		
		localColor : "",
		
		pieceAnimation : null,
		
        buildRendering: function() {
            this.domNode = domCons.toDom("<div style='position:relative'>" + 
												"<audio id='startSound' src='resources/sound/start.wav' preload='auto'></audio>" +
												"<audio id='moveSound' src='resources/sound/move.wav' preload='auto'></audio>" +
												"<audio id='exchangeSound' src='resources/sound/exchange.wav' preload='auto'></audio>" +
												"<audio id='castleSound' src='resources/sound/castle.wav' preload='auto'></audio>" +
												"<img src='widget/images/board.png'> </img>" + 
										  "</div>")
        },
		
		postCreate : function(){
			
			this.board = new Board()
			var self = this
			this.board.on("piece added", function(e){
				self.createPieceView(e.piece)
			})
		},
		
        startup: function() {

			this.initUi()
        },
		
		reset : function(){
			this.board.reset()
			this.initUi()
		},
		
        animateMove: function(move) {
			
            var pieceNode = dom.byId(this.board.getPieceAt(move.src).id)
			
			this.board.tryMove(move.src, move.dst, false)
			
            var left = (move.dst.col * this.squareWidth) + this.margin + this.squareHorizontalMargin
            var top = (move.dst.row * this.squareWidth) + this.margin + this.squareVerticalMargin
			
			var self = this
            this.pieceAnimation = fx.slideTo({node: pieceNode, duration: 400, left: left, top: top,
											  onEnd: function(){ 
													  try{
														self.repaint()
													  }
													  catch(err)
													  {	 
													  // Do nothing it's ok
													  } 
											}}).play()
        },
        placeInBoard: function(piece, square) {
			
            var left = (square.col * this.squareWidth)  + this.margin + this.squareHorizontalMargin
            var top = (square.row * this.squareWidth)  + this.margin + this.squareVerticalMargin
			
            domStyle.set(piece, "left", left + "px")
            domStyle.set(piece, "top", top + "px")

        },
        squareForPoint: function(p) {
            return {"row": Math.max(0, Math.min(Math.floor(p.y / this.squareWidth), 7)),
                    "col": Math.max(0, Math.min(Math.floor(p.x / this.squareWidth), 7))}
        },
        squareForPiece: function(pieceNode) {
            var centerX = domStyle.get(pieceNode, "left") + Math.floor(domStyle.get(pieceNode, "width") / 2) - this.margin
            var centerY = domStyle.get(pieceNode, "top") + Math.floor(domStyle.get(pieceNode, "height") / 2) - this.margin
            var dropSquare = this.squareForPoint({"x": centerX, "y": centerY})
            return dropSquare
        },
		
		createPieceView : function(piece){
		 
			var self = this
            var srcSquare
			
            var dragEndHandler = function() {
			
                var dstSquare = self.squareForPiece(this.handle)
				var piece = self.board.getPieceAt(srcSquare)
				
				if(self.localColor == piece.color){
					self.board.tryMove(srcSquare, dstSquare, true)
				}
				
				self.repaint()
            }

            var dragStartHandler = function() {
                srcSquare = self.squareForPiece(this.handle)
            }
			
			var attrs = {src: piece.getImage(), id: piece.id, style: {position: "absolute"}}
			var pieceNode = domCons.create("img", attrs, self.domNode)
			self.pieces.push(pieceNode)
				
			var moveable = new Moveable(pieceNode)
			moveable.onMoveStart = dragStartHandler
			moveable.onMoveStop = dragEndHandler	
		},
        
		initUi : function(){
		
			this.pieces.forEach(domCons.destroy)
			
            for (var i = 0; i < 8; i++) {
			
                for (var j = 0; j < 8; j++) {
					
                    var piece = this.board.getPieceAt({"row": i, "col": j})
					
                    if (piece) {
						this.createPieceView(piece)
                    }
                }
            }
			
			this.repaint()
		},
		
        repaint: function() {

			this.pieces.forEach(function(node){
				domStyle.set(node, "display" , "none")
			})
		
            for (var i = 0; i < 8; i++) {
                for (var j = 0; j < 8; j++) {
					
                    var piece = this.board.getPieceAt({"row": i, "col": j})
					
                    if (piece !== null) {

                        var pieceNode = dom.byId(piece.id)
                        this.placeInBoard(pieceNode, {"row": i, "col": j})
						domStyle.set(pieceNode, "display", "block")
                    }
                }
            }
        },
		
		destroy : function(){
		
			if(this.pieceAnimation){
				this.pieceAnimation.stop()
			}
			
			this.inherited(arguments)
		}
				
    })
})