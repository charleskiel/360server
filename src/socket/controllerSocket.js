const moment = require('moment')
var _ = require('lodash')
const os = require('os')
var EventEmitter2 = require("eventemitter2");


let event = new EventEmitter2({
	wildcard: true,
	delimiter: ".",
	newListener: false,
	removeListener: false,
	verboseMemoryLeak: false,
	ignoreErrors: false,
});
module.exports.event = event;

let status = {};

module.exports.load = () => { };

var net = require('net')
module.exports.server = net.createServer()
var port = 5001
var socketNum = 0;
var serverSockets = Object.create(null);

module.exports.server.listen(port, function () {
	console.log(`Controller port listening on : ${module.exports.server.address().port}`)
})

module.exports.server.on("connection", function (socket) {
	console.log(`Connection from ${socket.remoteAddress}`)
	socket.id = Math.random().toString(16).substring(2, 10).toUpperCase();

	serverSockets[socket.id] = socket;

	socket.on("data", function (d) {
		//console.log(serverSockets[socket.id].remoteAddress)
		console.log(`${d}`)
		if (d.includes('GET / HTTP/1.1')) {
			//socket.write(`Got from ${socket.remoteAddress + ":" + socket.remotePort}: ${d}`)
			console.log(`Got from ${socket.remoteAddress + ":" + socket.remotePort}: ${d}`)
			//debugger
			//socket.write("HTTP / 1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade")
			//socket.write("HTTP/1.1 200 OK\r\nAccess-Control-Allow-Credentials: true\r\nAccess-Control-Allow-Origin: *\r\nContent-Type: application/xml\r\nDate: Sat, 09 Nov 2019 22:09:03 GMT\r\nReferrer-Policy: no-referrer-when-downgrade\r\nServer: nginx\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: DENY\r\nX-XSS-Protection: 1; mode=block\r\nContent-Length: 522\r\nConnection: keep-alive\r\n\r\n")
		} else if (d) {
			try {
				if (`${d}`.includes("}{")) {
					d = `${d}`.replace(/}{/g, "}%{")
					d = `${d}`.split("%")
				}
				else {
					d = [`${d}`]
				}
				d.map(p => {
					//console.log(p)
					//if (!p.toString().includes("GET / HTTP/1.1")) p = JSON.parse(p)
					event.emit("msg", {socketId : socket.id, data: p })
					//console.log(status)
				})
			} catch (e) {
				console.log(e); // error in the above string (in this case, yes)!
			}
		}
	})

	socket.on("close", function () {
		console.log("Connection s% closed.", socket.remoteAddress)
		delete serverSockets[socket.id];
	})

	socket.on("error", function (err) {
		console.log("Error with s%: s%", socket.remoteAddress, err.name)
		console.log(err)
		err.message
		delete serverSockets[socket.id];
	})
})


module.exports.sendTo = (message, socketId = null) => {
	if (socketId) {
		console.log(`Sending to ${serverSockets[socketId].id} ${serverSockets[socketId].remoteAddress} :::  ${JSON.stringify(message)}`)
		serverSockets[socketId].write(JSON.stringify(message))
	} else {
		for (const con in serverSockets) {
			{ //console.log(`Sending to ${serverSockets[con].id} from NODE CONTROLLER :::  ${JSON.stringify(message)}`) } {
				if (serverSockets[con]) {
					serverSockets[con].write(JSON.stringify(message))
				}
			}
		}
	}
}


// function voteDetails() {
// 	let results = module.exports.status.modeSelections.list.map(video => {
// 		return { video: library.videos(_video), votes }
// 	})
// }




setInterval(function () {
	//console.log(" Ping Controller every 1 seconds ")

	status = {
		type: 'systemStatus',
		data: {
			app: {
			},
			system: {
				freemem: os.freemem(),
				totalmem: os.totalmem(),
				uptime: os.uptime(),
				loadavg: os.loadavg(),
				epoch: Date.now()
			}
		}
	}

	//event.emit("serverStatus", status)
	module.exports.sendTo(status)

}, 500)


event.on("*", function () {

	// for (const record in serverSockets) {
	// 	if (serverSockets[record].role = "indicator" ) {
	// 		serverSockets[record].write(
	// 			JSON.stringify(module.exports.status)
	// 		);
	// 	}
	// }
})