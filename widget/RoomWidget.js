define(["dojo/_base/declare",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/RoomWidget.html",
		"dojo/on",
		"/widget/BoardWidget.js",
		"dojo/dom-style",
		"dojo/_base/lang",
		"dojo/dom",
		"/widget/DiagramWidget.js",
		"/widget/ScoreWidget.js",
		"dojo/dom-attr"],
    function(declare, _WidgetBase, _TemplatedMixin, template, on, BoardWidget, domStyle, lang, dom, DiagramWidget, ScoreWidget, domAttr){
	
        return declare("RoomWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			socket: null,
			
			lobbyWidget : null,
			
			game : null,
			
			boardWidget : null,
			
			hostPanel : null,
			
			opponentPanel : null,
			
			watchersPanel : null,
			
			chatWidget: null,
			
			diagramWidget : null,
			
			scoreWidget: null,
			
			pieceCollector : null,
			
			hostReady : false,
			
			opponentReady : false,
			
			remoteMoveListener : function(move) {
				
				this.boardWidget.animateMove(move)
            },
				
			chatListener : function(msg) {
			
				var color = "black" 
				if(msg == "&ltWhite wins&gt"){
					this.diagramWidget.append("1-0")
					color = "gray"
				}
				if(msg == "&ltBlack wins&gt"){
					this.diagramWidget.append("0-1")
					color = "gray"
				}
				this.chatWidget.insertChat(msg, color)
            },
				
			lateJoinCallback : function(moves){
				
				moves.forEach(function(move){
					this.boardWidget.board.tryMove(move.src, move.dst, false)
				}, this)
				
				this.boardWidget.repaint()
			},
			
			readyListener : function(username){
				this.chatWidget.insertChat("&lt" + username +"&gt is ready", "gray")
				if(this.game.users[0].name == username ){
					this.hostReady = true
				}
				else{
					this.opponentReady = true
				}	
			},
			
			notReadyListener : function(username){
				this.chatWidget.insertChat("&lt" + username +"&gt is not ready", "gray")
				if(this.game.users[0].name == username ){
					this.hostReady = false
				}
				else{
					this.opponentReady = false
				}	
			},
			
			postCreate : function(){
				
				this.initUi()
				
				this.updateUsersPanels()
				this.updateTitleLabel()
				this.updatePopLabel()
				this.updateDescriptionLabel()
				this.updateStateLabel()
				
				var self = this
				
				this.own(
				
					on(this.chatWidget.sendButton, "click", function(){
				
						if(self.chatWidget.chatField.value){
							self.socket.emit('room chat', self.chatWidget.chatField.value)
							self.chatWidget.chatField.value = ""
							self.chatWidget.chatField.value = ""
						}
					}),
					
					on(this.readyCheckBox, "click", function(){
					
						if(self.game.users.length == 1 || self.game.state == "playing") return
						
						self.setReadyCheckBoxChecked(!self.isReadyCheckBoxChecked())
						
						var ready = self.isReadyCheckBoxChecked()
						
						self.socket.emit(ready? "ready" : "not ready")
					}),
					
					on(this.startButton, "click", function(){
						
						if(self.game.state == "playing") return
						
						if(self.hostReady && self.opponentReady && self.game.state == "waiting"){
							self.socket.emit("game started")
							self.hostReady = false
							self.opponentReady = false
						}
						else{
							if(self.game.users.length == 1){
								self.chatWidget.insertChat("&ltPlease wait for an opponent before playing&gt", "gray")
							}
							else{
								self.chatWidget.insertChat("&ltBoth players must be ready for the game to start&gt", "gray")
							}
						}
				
					}),
					
					this.game.watch("numberOfUsers", function(attr, oldVal, newVal) {
						self.updateUsersPanels()
						this.updatePopLabel()
					}),
					
					this.game.watch("title", function(attr, oldVal, newVal) {
						self.updateTitleLabel()
					}),
					
					this.game.watch("description", function(attr, oldVal, newVal) {
						self.updateDescriptionLabel()
					}),
					
					this.game.watch("state", function(attr, oldVal, newVal) {
					
						self.updateStateLabel()
						
						if(newVal == "playing"){
							self.boardWidget.reset()
							self.diagramWidget.reset()
							self.scoreWidget.reset()
							self.setReadyCheckBoxChecked(false)
							
							var localColor 
							if(self.game.users[0] == self.lobbyWidget.user){
								localColor = "White"
							}
							else if(self.game.users[1] == self.lobbyWidget.user){
								localColor = "Black"
							}
							self.boardWidget.localColor = localColor
							
							dom.byId("startSound").play()
							self.chatWidget.insertChat("&ltGame started&gt", "gray")
						}
					}),
					
					this.boardWidget.board.on("state changed", function(e){
						
						var move = e.move
						
						if(e.isLocalMove){
							self.socket.emit('move', {"src" : move.src, "dst" : move.dst})
							
							if(move.isCheckMate){
								
								self.socket.emit('game ended', move.piece.color)
							}
						}
						
						if(move.isExchange){
							self.scoreWidget.collect(move.takenPiece)
						}
						
						self.scoreWidget.updateCapturedPieces()
						
						self.diagramWidget.append(move.toChessAlphaString())
						
						var soundNodeId = move.isExchange ? "exchangeSound" : move.isCastle ? "castleSound" : "moveSound"
						dom.byId(soundNodeId).play()
					})
				)
				 
				this.remoteMoveListener = lang.hitch(this, this.remoteMoveListener)
				this.chatListener = lang.hitch(this, this.chatListener)
				this.lateJoinCallback = lang.hitch(this, this.lateJoinCallback)
				this.readyListener = lang.hitch(this, this.readyListener)
				this.notReadyListener = lang.hitch(this, this.notReadyListener)
				
				this.socket.on('move', this.remoteMoveListener)
				this.socket.on('played moves', this.lateJoinCallback)
				this.socket.on('room chat', this.chatListener)
				this.socket.on('ready', this.readyListener)
				this.socket.on('not ready', this.notReadyListener)
			},
		
			startup: function(){
				
				var self = this
				
				this.own(this.boardWidget.watch("lastMove", function(attr, oldVal, newVal) {
					self.socket.emit('move', newVal)
                }))
				
				// Don't set on the template because it'll get overridden by some dojo class
				domStyle.set(this.leftPanel, "overflow", "visible")
			},
			
			showHostToolbar : function(){
				domStyle.set(this.settsButton, "display", "inline-block")
				domStyle.set(this.readyCheckBox, "display", "inline-block")
				domStyle.set(this.startButton, "display", "inline-block")
			},
			
			showOpponentToolbar : function(){
				domStyle.set(this.settsButton, "display", "none")
				domStyle.set(this.readyCheckBox, "display", "inline-block")
				domStyle.set(this.startButton, "display", "none")
			},
			
			showWatcherToolbar : function(){
				domStyle.set(this.settsButton, "display", "none")
				domStyle.set(this.readyCheckBox, "display", "none")
				domStyle.set(this.startButton, "display", "none")		
			},
			
			setReadyCheckBoxChecked : function(bool){
				if(bool){
					domAttr.set(this.readyCheckBoxImg, "src", "/widget/images/room/checked.png")  
				}
				else{
					domAttr.set(this.readyCheckBoxImg, "src", "/widget/images/room/unchecked.png")  
				}
			},
			
			isReadyCheckBoxChecked : function(){
				return domAttr.get(this.readyCheckBoxImg, "src") === "/widget/images/room/checked.png" ? true : false
			},
			
			host: null,
			
			opponent : null,
			
			updateUsersPanels : function(){
			
				this.hostPanel.reset()
				this.opponentPanel.reset()
				this.watchersPanel.reset()
				this.scoreWidget.clearUsers()
				
				var self = this
				var newHost = this.game.users[0] != this.host
				var newOpponent = this.game.users[1] != this.opponent
				
				if(newHost){
					this.hostReady = false
					this.opponentReady = false
					this.setReadyCheckBoxChecked(false)
				}
				if(newOpponent){
					this.opponentReady = false
				}	
				
				this.game.users.forEach( function(user, i){
				
					if(i === 0){
						targetPanel = self.hostPanel
						self.scoreWidget.setWhiteName(user.name)
						self.scoreWidget.setWhiteRating(user.rating)
						
						self.host = user
					}
					else if(i === 1){
						targetPanel = self.opponentPanel
						self.scoreWidget.setBlackName(user.name)
						self.scoreWidget.setBlackRating(user.rating)
						
						self.opponent = user
					}
					else{
						targetPanel = self.watchersPanel
					}
						
					targetPanel.addUser(user)
				})
				
				if(this.game.users.indexOf(this.lobbyWidget.user) == 0){
					this.showHostToolbar()
				}
					
				else if(this.game.users.indexOf(this.lobbyWidget.user) == 1){
					this.showOpponentToolbar()
				}
					
				else{
					this.showWatcherToolbar()
				}	
			},
			
			updateTitleLabel : function(){
				domAttr.set(this.titleLabel, "innerHTML", this.game.title)
			},
			
			updatePopLabel : function(){
				domAttr.set(this.popLabel, "innerHTML", "Players " + this.game.users.length + "/8")
			},
			
			updateDescriptionLabel : function(){
				domAttr.set(this.descriptionLabel, "innerHTML", this.game.description.replace("\n", "<br>"))
			},
			
			updateStateLabel : function(){
				domAttr.set(this.stateLabel, "innerHTML", this.game.state === "waiting" ? "Waiting for players" : "Game in progress")
			},
			
			initUi : function(){
			
				this.hostPanel  = new UserPanelWidget({"header" : "Host", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				this.opponentPanel  = new UserPanelWidget({"header" : "Opponent", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				this.watchersPanel  = new UserPanelWidget({"header" : "Spectators", "color" : "white", "lobbyWidget" : this.lobbyWidget})
				
				this.hostPanel.placeAt(this.leftPanel)
				this.opponentPanel.placeAt(this.leftPanel)
				this.watchersPanel.placeAt(this.leftPanel)
				
				this.scoreWidget = new ScoreWidget()
				this.scoreWidget.placeAt(this.scoreWidgetContainer)
				
				this.hostPanel.setNumberPainted(false)
				this.opponentPanel.setNumberPainted(false)
				
				this.chatWidget = new ChatWidget()
				this.chatWidget.placeAt(this.chatContainer)
				domStyle.set(this.chatWidget.containerNode , "width", "98.5%")
				
				this.boardWidget = new BoardWidget()
				this.boardWidget.placeAt(this.boardContainer)
				
				this.diagramWidget = new DiagramWidget()
				this.diagramWidget.placeAt(this.rightPanel)
				
			},
			
			destroy : function(){
				
				this.socket.removeListener('move', this.remoteMoveListener)
				this.socket.removeListener('room chat', this.chatListener)
				this.socket.removeListener('played moves', this.lateJoinCallback)
				this.socket.removeListener('ready', this.readyListener)
				this.socket.removeListener('not ready', this.notReadyListener)
			
				this.inherited(arguments)
			}
        })
		 
})