var net = require('net')
var fs = require('fs');
var https = require('https');
var http = require('http');
var EventEmitter2 = require("eventemitter2");
var WebSocketServer = require('ws').Server;

var clientSockets = Object.create(null);
var httpsPort = 9001;
var httpPort = 9000
let event = new EventEmitter2({
	wildcard: true,
	delimiter: ".",
	newListener: false,
	removeListener: false,
	verboseMemoryLeak: false,
	ignoreErrors: false,
});

module.exports.WebSocketEvent = event;
module.exports.Multicast = Multicast;
module.exports.clientSockets = clientSockets;


// var httpsServer = https.createServer(credentials).listen(httpsPort, function () { console.log(`Remote Websocket listening on ${httpsServer.address().port}`) })
var httpDevServer = http.createServer().listen(httpPort, function () { console.log(`Market Manager Websocket listening on ${httpDevServer.address().port}`) })

// var remotes = new WebSocketServer({ server: httpsServer });
var locals = new WebSocketServer({ server: httpDevServer });

// remotes.on('connection', function connection(ws) { addNewConnection(ws._socket.remoteAddress, ws); ws.on('message', function (msg) { handleData(msg, ws) }) })
locals.on('connection', function connection(ws) { addNewConnection(ws._socket.remoteAddress, ws); ws.on('message', function (msg) { handleData(msg, ws) }) })

function addNewConnection(ipAddress, ws) {
	console.log(`MM Websocket connection from ${ipAddress}`)
	event.emit("connection", ipAddress)
	clientSockets[ipAddress] = {
		"ip": ipAddress,
		"DataTx": 0,
		"DataRx": 0
	}
}

function handleData(msg, ws) {
	console.log("mm=> ", msg)
	var j
	try {
		j = JSON.parse(msg)
	} catch (e) {
		alert(e);
	}
	event.emit("msg", JSON.parse(msg))
}

function Multicast(message) {
	//console.log(`message=> ${JSON.stringify(message)}`)
	// remotes.clients.forEach(client => {
	// 	if (client !== remotes && client.readyState === 1) {
	// 		clientSockets[client._socket._peername.address].DataTx += JSON.stringify(message).length
	// 		client.send(JSON.stringify(message))
	// 	}
	// });
	locals.clients.forEach(client => {
		if (client.readyState === 1) {
			clientSockets[client._socket._peername.address].DataTx += JSON.stringify(message).length
			client.send(JSON.stringify(message))
		}
	});
}
