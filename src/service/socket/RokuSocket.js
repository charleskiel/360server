var net = require('net')
var fs = require('fs');
var https = require('https');
var EventEmitter2 = require("eventemitter2");
var clientSockets = Object.create(null);

let event = new EventEmitter2({
	wildcard: true,
	delimiter: ".",
	newListener: false,
	removeListener: false,
	verboseMemoryLeak: false,
	ignoreErrors: false,
});

module.exports.event = event;

var credentials = {
	key: fs.readFileSync('/etc/letsencrypt/live/360tv.net/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/360tv.net/fullchain.pem')
};

var httpsServer = https.createServer(credentials).listen(5003, function () {
	console.log(`Remote Control port listening on ${httpsServer.address().port}`)
})

var WebSocketServer = require('ws').Server;
var remotes = new WebSocketServer({ server: httpsServer });

remotes.on('connection', function connection(ws) {
	console.log("Remote controll connection from " + ws._socket.remoteAddress)
	ws.on('message', msg => {
		console.log(ws._socket.remoteAddress, msg)
		event.emit("msg", JSON.parse(msg))
		if (msg.messageType == "login") {
			clientSockets[ws] = new User(msg.data, ws, loggedin)
			console.log(`Logged in: ${JSON.stringify(clientSockets[ws])}`)
			//clientSockets[ws].socket.send(JSON.stringify(clientSockets[ws]))
		}
		if (msg.messageType == "nowPlayingStatus") { nowPlaying(msg.data) }
		if (msg.messageType == "nowPlayingList") { nowPlayingList(msg.data) }
		if (msg.messageType == "remotecontrol") { sendToController(msg) }
		if (msg.messageType == "command") {
			//console.log(clientSocket.clients[ws])
			sendToController(msg)
		}
	})
})



function loggedin(data, socket, results) {
	console.log(results)
	console.log(user)
	if (results[0]) {
		clientSockets[socket] = { ...clientSockets[socket], ...data, ...results[0], ...{ "status": "OK" } }
		clientSockets[socket].socket.send(JSON.stringify(clientSockets[socket]))
		//socket.send(JSON.stringify(clientSockets[socket]))
		console.log(`Logged in: ${results[0].regtoken}] ${results[0].FirstName} ${results[0].LastName}`)

	} else {
		socket.send(JSON.stringify({ "status": "ERROR", "message": "Not Authorized" }))
		socket.close()
	}
}

function sendToRemotes(message) {
	console.log(`message=> ${JSON.stringify(message)}`)
	remotes.clients.forEach(client => {
		if (client !== remotes && client.readyState === 1) {
			console.log(`message=====> ${JSON.stringify(message)}`)
			client.send(JSON.stringify(message))
		}
	});
}
