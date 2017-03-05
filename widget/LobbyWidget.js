define(["dojo/_base/declare",
		"dojo/on",
		"dijit/Dialog",
		"/widget/RoomWidget.js",
		"dijit/_WidgetBase",
		"dijit/_TemplatedMixin",
		"dojo/text!./templates/LobbyWidget.html",
		"dojo/parser",
		"/widget/GameWidget.js",
		"/widget/ChatWidget.js",
		"/widget/UserPanelWidget.js",
		"/widget/DirectMessageWidget.js",
		'dojo/_base/unload',
		"dojo/aspect",
		"dojo/Stateful",
		],
    function(declare, on, Dialog, RoomWidget, _WidgetBase, _TemplatedMixin,
	template, parser, GameWidget, ChatWidget, UserPanelWidget, DirectMessageWidget, unload, aspect, Stateful){
	
        return declare("LobbyWidget",[_WidgetBase, _TemplatedMixin], {
		
            templateString: template,
			
			socket: null,
			
			roomWidget : null,
			
			chatWidget : null,
			
			totalUsersPanelWidget : null,
			
			lookingUsersPanelWidget : null,
			
			waitingUsersPanelWidget : null,
			
			playingUsersPanelWidget : null,
			
			users: new declare([Stateful], {
					
					count : 0,
					
					add : function(user){
						this[user.name] = user
						this.set('count', ++this.count)
					},
					
					remove : function(name){
						this[name].set("state", "left")
						delete this[name] 
						this.set('count', --this.count)
					}
				  })(),
			
			user: null,
			
			smileyToImg: {},
			
			games : [],
			
			User : declare([Stateful], {
					name: null, 
					rating: 0, 
					country : null,
					state: null, 
					wins : 0, 
					losses : 0,
					draws : 0,
					room : 0
				  }),
			
			lostConnection : false,
			
			dmWidgets : {},
			
			postCreate : function(){
		
				this.socket.emit('lobby join', this.user)
				
				this.initUi()
				
				var self = this
				
				on(this.chatWidget.sendButton, "click", function(){
					
					if(self.chatWidget.chatField.value){
						self.socket.emit('lobby chat', self.chatWidget.chatField.value)
						self.chatWidget.chatField.value = ""
					}
				});
		
				aspect.before(this.socket, "emit", function(a){
					if(self.lostConnection) return ["ignore"]
				  });
				  
				this.socket.on('disconnect', function(games) {
			
					self.lostConnection = true 
                });
				
				this.socket.on('games', function(games) {
				
					games.forEach(function(game, i){
					
						for (var attr in game) {
						
							if(attr == "users"){
								
								var newUsers = []
								game[attr].forEach(function(username){
									newUsers.push(self.users[username])
								})
								
								self.games[i].set(attr, newUsers) 
							}
							else{
								self.games[i].set(attr, game[attr]) 
							}
						}
						// did this way because StatefulArray is bugged
						self.games[i].set("numberOfUsers", game.users.length)
					});
                });
				
				this.socket.on('users', function(users) {
					
					users.forEach( function(user){
					
						self.users.add(self.newUser(user))
					})
					
                });
				
				this.socket.on('lobby join', function(user) {
					
					self.users.add(self.newUser(user))
					
					self.chatWidget.insertChat("&lt" + user.name + " has joined the lounge&gt", "gray")
					
                });
				
				this.socket.on('lobby leave', function(username) {
				
					self.users.remove(username)
					self.chatWidget.insertChat("&lt" + username + " has left the lounge&gt", "gray")
                });
				
				 this.socket.on('lobby chat', function(msg) {
					self.chatWidget.insertChat(msg, "black");
                });
				
				this.socket.on('room join', function(username, roomId, moves) {
				
					var user = self.users[username]
					var game = self.games[roomId]
					game.addUser(user)

					if(self.user.name === username){
						
						self.roomWidget = new RoomWidget({"socket":self.socket, game : self.games[roomId], lobbyWidget : self })
								
						var roomDialog = new Dialog({
													title: "Game " + (roomId + 1) + ": " + game.title,
													content: self.roomWidget,
													style: "width:855px;",
													baseClass: 'dijitContentPaneNoPadding',
													class:'nonModal'
													})
													
						var handle = game.watch("title", function(name, oldValue, value){
							if(value){
								roomDialog.set("title", "Game " + (roomId + 1) + ": " + value)
							}
							else{
								roomDialog.set("title", "Game " + (roomId + 1))
							}
						})
													
						on(roomDialog, "hide", function(){
							
							handle.unwatch()
							self.roomWidget.destroyRecursive()
							self.roomWidget = null
							self.socket.emit('room leave')
									
						 })
						  
						roomDialog.show()
						parser.parse(self.roomWidget.containerNode)	
					}
					
					if(self.roomWidget && roomId === self.roomWidget.game.gameId){
						self.roomWidget.chatWidget.insertChat("&lt" + user.name + " has joined the room&gt", "gray")
					}
					
                })
				
				this.socket.on('room leave', function(username) {
					
					var user = self.users[username];
					var roomId = user.room
					self.games[roomId].removeUser(user);
					
					if(self.roomWidget && roomId === self.roomWidget.game.gameId){
						self.roomWidget.chatWidget.insertChat("&lt" + user.name + " has left the room&gt", "gray")
					}
                })
				
				this.socket.on('game attributes', function(roomId, attrs) {
					
					for (var attr in attrs) {
						self.games[roomId].set(attr, attrs[attr]) 
					}
                })
				
				this.socket.on('private chat', function(fromUsername, msg) {
					
					if(self.dmWidgets[fromUsername]){
						self.dmWidgets[fromUsername].chatWidget.insertChat(msg, "black")
					}
					else{
						var dmWidget = new DirectMessageWidget({"socket": self.socket, "toUsername":fromUsername, "username": self.user.name} )
						self.dmWidgets[fromUsername] = dmWidget
						
						var d = new Dialog({ title : "Dojo Chess - Conversation",
											 content: dmWidget,
											 baseClass: 'dijitContentPaneNoPadding',
											 class:'nonModal'
											})	
											
						on(d, "hide", function(){
							
							delete self.dmWidgets[fromUsername] 
									
						 })
						 
						d.show()
						
						dmWidget.chatWidget.insertChat(msg, "black")
					}
                })
				
				unload.addOnWindowUnload(function(e){
				
					// self.socket.emit('lobby leave', self.user)
				})
			
			},
			
			newUser : function(rawUser){
				
				var self = this
			
				var getUserPanelForState = function(state){
					var panel 
					if(state === "looking"){
						panel = self.lookingUsersPanelWidget
					}
					if(state === "waiting"){
						panel = self.waitingUsersPanelWidget
					}
					if(state === "playing"){
						panel = self.playingUsersPanelWidget
					}
					
					return panel
				}
			
				var user = new this.User()
				
				if(this.user.name == rawUser.name){
				
					this.user = user
				
					for (var attr in rawUser) {
						user.set(attr, rawUser[attr]) 
					}
				
					this.totalUsersPanelWidget.addUser(user)
					
					user.watch("state", function(attr, oldVal, newVal){
						
						var color = newVal === "waiting"? "#888888" : newVal === "looking" ? "white" : "#606060"
						self.totalUsersPanelWidget.set("color" , color)
						
					})
				}
				else{
					user.watch("state", function(attr, oldVal, newVal){
				
						if(oldVal !== newVal){
						
							var panel = getUserPanelForState(oldVal)
							if(panel){
								panel.removeUser(user)
							}
							
							panel = getUserPanelForState(newVal)
							if(panel){
								panel.addUser(user)
							}
						}
					})
					
					for (var attr in rawUser) {
						user.set(attr, rawUser[attr]) 
					}
					
				}
				
				return user
			},
			
			initUi : function(){
			
				var self = this
				
				// Users
				this.totalUsersPanelWidget = new UserPanelWidget({"header" : "Total Players", "color" : "white", "trackUserCount": false, "lobbyWidget" : this})
				this.totalUsersPanelWidget.placeAt(this.usersContainer)
				
				this.users.watch("count", function(attr, oldVal, newVal){
					self.totalUsersPanelWidget.setPaintedNumberOfUsers(newVal)
				})
			
				this.lookingUsersPanelWidget = new UserPanelWidget({"header" : "Looking", "color" : "white", "lobbyWidget" : this})
				this.lookingUsersPanelWidget.placeAt(this.usersContainer)
				
				this.waitingUsersPanelWidget = new UserPanelWidget({"header" : "Waiting", "color" : "#888888", "lobbyWidget" : this})
				this.waitingUsersPanelWidget.placeAt(this.usersContainer)
				
				this.playingUsersPanelWidget = new UserPanelWidget({"header" : "Playing", "color" : "#606060", "lobbyWidget" : this})
				this.playingUsersPanelWidget.placeAt(this.usersContainer)
	
				// Chat
				this.chatWidget = new ChatWidget();
				this.chatWidget.placeAt(this.bottomContainer);
				
				// Rooms
				var self = this;
				
				for(var i=0; i <= 99; i++){
					
					var gameWidget = new GameWidget({"user": self.user, "gameId": i, "lobbyWidget": this});
					gameWidget.placeAt(this.roomsContainer);
					self.games.push(gameWidget);
					
					on(gameWidget.mainButton, "click", function(roomId){
					
							return function(){
							
								if(self.games[roomId].users.length === 8){
									return;
								}
								self.socket.emit('room join', roomId);
							}
						}(i));
				}
			},
			
        });
});