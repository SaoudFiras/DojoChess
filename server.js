
var express = require("express")
var fs = require('fs')
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)

io.set('log level', 1)
app.use(express.static(__dirname))

var port = (process.env.PORT || 8080)
server.listen(port)
console.log('listening on port: ' + port)

var users = []
var games = []

for(var i = 0; i <= 99; i++){
	games[i] = {users: [], state: "free", title: "", moves : []}
}

userNameToSocket = {}

io.sockets.on('connection', function (socket) {

	socket.on('lobby join', function(user){

		socket.emit("users", users)

		// game moves are being unnecessarily sent
		socket.emit("games", games)

		userNameToSocket[user.name] = socket
		socket.user = user
		users.push(user)

		io.sockets.emit('lobby join', user)
	})

	socket.on('disconnect', function(){

		var user = socket.user

		console.log("disconnect " + JSON.stringify(user))

		users = users.filter(function(u){

			return u.name != user.name
		})

		if(user.room != -1){

			socket.leave(user.room)
			var game = games[user.room]

			game.users.splice(game.users.indexOf(user.name), 1)

			if(game.users.length === 0){
				game.state = "free"
				game.title = ""
				game.moves = []
			}

			io.sockets.emit('room leave', user.name)
		}

		delete userNameToSocket[user.name]

		io.sockets.emit('lobby leave', user.name)
	})

	socket.on('lobby chat', function(msg){
		io.sockets.emit('lobby chat', "&lt" + socket.user.name + "&gt " +  msg)
	})

	socket.on('room join', function(roomId){

		var game = games[roomId]
		if(game.users.length === 8){
			return
		}

		if(game.users.length === 0){
			game.title = socket.user.name + "'s Game"
		}

		game.users.push(socket.user.name)
		if(game.users.length === 1){
			game.state = "waiting"
		}

		socket.user.room = roomId
		socket.user.state = "waiting"
		socket.join(socket.user.room)
		io.sockets.emit('room join', socket.user.name, roomId)

		socket.emit("played moves" , game.moves)
	})

	socket.on('room leave', function(){

		var roomId = socket.user.room
		var game = games[roomId]

		game.users.splice(game.users.indexOf(socket.user.name), 1)

		if(game.users.length === 0){

			game.moves = []
			game.state = "free"
			game.title = ""
		}

		io.sockets.emit('room leave', socket.user.name)
		socket.leave(socket.user.room)
		socket.user.room = -1
		socket.user.state = "looking"
	})

	socket.on('room chat', function(msg){
		io.sockets.in(socket.user.room).emit('room chat', "&lt" + socket.user.name + "&gt " +  msg)
	})

	socket.on('move', function(move){

		games[socket.user.room].moves.push(move)
		socket.broadcast.to(socket.user.room).emit('move', move)
	})

	socket.on('private chat', function(toUsername, msg){

		// if toUsername is not in userNameToSocket, the sendee is a bot
		var dstSocket = userNameToSocket[toUsername]

		if(dstSocket){
			dstSocket.emit('private chat', socket.user.name, "&lt" + socket.user.name + "&gt " +  msg )
		}
		else{
			socket.emit('private chat', toUsername, "&lt" + toUsername + "&gt " +  "Sorry I'm a bot, I can't talk much :(" )
		}

	})

	socket.on('game started', function(){

		var game = games[socket.user.room]
		game.state = "playing"
		io.sockets.emit('game attributes', socket.user.room, {state : game.state})
	})

	socket.on('game ended', function(winningColor){

		var game = games[socket.user.room]
		game.state = "waiting"
		io.sockets.in(socket.user.room + "").emit("room chat", "&lt" + winningColor + " wins&gt")
		io.sockets.emit('game attributes', socket.user.room, {state : game.state})
	})

	socket.on('ready', function(){

		io.sockets.in(socket.user.room + "").emit("ready", socket.user.name)
	})

	socket.on('not ready', function(){

		io.sockets.in(socket.user.room + "").emit("not ready", socket.user.name)
	})

	socket.on('ignore', function(){
		// recieved from an out of sync client, do nothing
	})

})

var playGame = function(filePath, roomId){

	var game = games[roomId]
	var events = []
	var moves = []

	fs.readFile(__dirname + filePath, {encoding: 'utf-8'}, function(err,data){

			if (!err){

				data.toString().split("\n").forEach(function(line){

					moves.push(JSON.parse(line.trim()))
				})

				moves.forEach(function(move){
						events.push({"name":"move", "data":move})
					})

				var white = game.users[0]
				var black = game.users[1]
				var winner = moves.length % 2 === 0 ? black : white
				var looser = moves.length % 2 === 0 ? white : black

				events.push({"name":"room chat", "data": "&lt" + (winner === white ? "White" : "Black") + " wins&gt"})
				events.push({"name":"room chat", "data": "&lt" + looser + "&gt " +  "well played :thumbsup:"})
				events.push({"name":"room chat", "data": "&lt" + winner + "&gt " +  "thanks :flowers:"})
				events.push({"name":"room chat", "data": "&lt" + looser + "&gt " +  ((Math.floor(Math.random() * 2) + 1) == 1? "rematch?" : "one more?")})
				events.push({"name":"room chat", "data": "&lt" + winner + "&gt " +  "sure"})
				events.push({"name":"room chat", "data": "&lt" + winner + "&gt " +  "let's go"})

				emitNextEvent(roomId, 0, events)

			}else{
				console.log(err)
			}
		})
}

var emitNextEvent = function(roomId, eventIndex, events){

	var game = games[roomId]

	if(eventIndex === 0){
		game.state = "playing"
		io.sockets.emit('game attributes', roomId, {state : game.state})
	}

	var event = events[eventIndex]
	if(event.name === "move"){
		game.moves.push(event.data)
	}

	io.sockets.in(roomId + "").emit(event.name, event.data)

	eventIndex++

	var delay = Math.random() * (5000 - 1000) + 1000

	if(eventIndex == events.length - 6){
		// if it was the last move, aknowledge fast that the game is over
		delay = 100
	}

	if(eventIndex == events.length - 5){

		game.state = "waiting"
		io.sockets.emit('game attributes', roomId, {state : game.state})
	}

	if(eventIndex == events.length ){
		eventIndex = 0
		game.moves = []
	}

	setTimeout(function(){emitNextEvent(roomId, eventIndex, events)}, delay)
}

var kasparov = {"name":"Garry Kasparov", "rating":2812,  "country" : "Russia", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 8}
var topalov = {"name":"Veselin Topalov", "rating":2772,  "country" : "Bulgaria", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 8}
var anderssen = {"name":"Adolf Anderssen", "rating":2600,  "country" : "Germany", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 1}
var dufresne = {"name":"Jean Dufresne", "rating":2370,  "country" : "Germany", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 1}
var levitsky = {"name":"Stepan Levitsky", "rating":2450,  "country" : "United States", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 2}
var marshall = {"name":"Frank Marshall", "rating":2706,  "country" : "United States", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 2}
var carlsen = {"name":"Magnus Carlsen", "rating":2484,  "country" : "Norway", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 3}
var ernst = {"name":"Spike Ernst", "rating":2474,  "country" : "Netherlands", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 3}
var morphy = {"name":"Paul Morphy", "rating":2638,  "country" : "United States", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 0}
var karl = {"name":"Duke Karl", "rating":2250,  "country" : "Germany", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 0}
var tal = {"name":"Mikhail Tal", "rating":2799,  "country" : "Russia", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 7}
var larsen = {"name":"Bent Larsen", "rating":2660 ,  "country" : "Denmark", "state":"playing", "wins" : 0, "losses" : 0, "draws" : 0, "room" : 7}

users.push(kasparov, topalov)
games[8].users = [kasparov.name, topalov.name]
games[8].title = "Kasparov's immortal"
games[8].description = "Hoogovens 1999 Tournament.\n A brillancy among briallncies."

users.push(anderssen, dufresne)
games[1].users = [anderssen.name, dufresne.name]
games[1].title = "The Evergreen Game"
games[1].description = "Berlin, 1852.\n Friendly game."

users.push(levitsky, marshall)
games[2].users = [levitsky.name, marshall.name]
games[2].title = "American Beauty"
games[2].description = "Breslau, 1912.\n 23. Qg3, the greatest chess move ever played?"

users.push(carlsen, ernst)
games[3].users = [carlsen.name, ernst.name]
games[3].title = "Carlsen vs Ernst"
games[3].description = "Netherlands, 2004.\n The Magnus Effect."

users.push(morphy, karl)
games[0].users = [morphy.name, karl.name]
games[0].title = "A Night at the Opera"
games[0].description = "Paris 1858"

users.push(tal, larsen)
games[7].users = [tal.name, larsen.name]
games[7].title = "A Bent Pin"
games[7].description = "Yugoslavia 1965"

playGame("/resources/pgn/topalov_kasparov_1999.txt", 8)
playGame("/resources/pgn/anderssen_dufresne_1852.txt", 1)
playGame("/resources/pgn/levitsky_marshall_1912.txt", 2)
playGame("/resources/pgn/ernst_carlsen_2004.txt", 3)
playGame("/resources/pgn/morphy_duke.txt", 0)
playGame("/resources/pgn/tal_larsen_1965.txt", 7)
