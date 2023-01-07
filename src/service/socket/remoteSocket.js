import net from 'net';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import EventEmitter2 from "eventemitter2";
export { event, sendToRemotes };

let event = new EventEmitter2({
	wildcard: true,
	delimiter: ".",
	newListener: false,
	removeListener: false,
	verboseMemoryLeak: false,
	ignoreErrors: false,
});


var credentials = {
	key: readFileSync('/etc/letsencrypt/live/360tv.net-0003/privkey.pem'),
	cert: readFileSync('/etc/letsencrypt/live/360tv.net-0003/fullchain.pem')
};

var httpsServer = createServer(credentials).listen(5002, function() {
	console.log(`Remote Control port listening on ${httpsServer.address().port}`)
})

import { Server as WebSocketServer } from 'ws';
var remotes = new WebSocketServer({ server: httpsServer });

remotes.on('connection', function connection(ws) {
	event.emit("Connected", ws);
	console.log(ws)
	ws.on('message', msg => {
		event.emit("msg", { socket: ws, msg : JSON.parse(msg) } )
		// if (msg.messageType == "login") {
		// 	clientSockets[ws] = new User(msg.data, ws, loggedin)
		// 	// console.log(`Logged in: ${JSON.stringify(clientSockets[ws])}`)
		// 	//clientSockets[ws].socket.send(JSON.stringify(clientSockets[ws]))
		// }
		if (msg.messageType == "nowPlayingStatus") { nowPlaying(msg.data) }
		if (msg.messageType == "nowPlayingList") { nowPlayingList(msg.data) }
		if (msg.messageType == "remotecontrol") { sendToController(msg) }
		if (msg.messageType == "command") {
			// sendToController(msg)
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
	// console.log(`message=> ${JSON.stringify(message)}`)
	remotes.clients.forEach(client => {
		if (client !== remotes && client.readyState === 1) {
			// console.log(`message=====> ${JSON.stringify(message)}`)
			client.send(JSON.stringify(message))
		}
	});
}
