define([
    "dojo/_base/declare",
], function(declare) {

    return declare("Move", null, {
	
		piece : null,
		
		takenPiece : null,
		
		src : null,
		
		dst : null,
		
		isEnPassant : false,
		
		isExchange : false,
		
		isCheck : false,
		
		isCheckmate : false,
		
		isAmbiguious : false,
		
		isPromotion : false,
		
		columns : "abcdefgh".split(""),
		
		rows : "87654321".split(""),
	
		constructor: function(args){
			declare.safeMixin(this,args);
		},

		toChessAlphaString : function(){

            if(this.piece instanceof King){

                /*Castle King side*/
                if(this.dst.col  - this.src.col === 2)
                     return("0-0")
                /*Castle Queen side*/
                if(this.dst.col  - this.src.col === -2)
                     return("0-0-0")
            }
            
            var str = this.piece.getChessAlphaChar()

            if(this.isAmbiguious && !(this.piece instanceof Pawn))
                str += this.columns[this.src.col]
            if(this.isExchange || this.isEnPassant){
                
                if(this.piece instanceof Pawn)
                    str += this.columns[this.src.col]

                str += "x"
            }
                
            str += this.columns[this.dst.col]
            str += this.rows[this.dst.row]

            if(this.isPromotion)
                str += "=" + (this.color === "White"? "m" : "M")

            if(this.isCheck)
                str += "+"
            if(this.isCheckMate)
                str = str.replace('+', '#')

            return str
        }
    })
})