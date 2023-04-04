import {nginxEvent, websiteEvent, User, channelEvent, contentEvent, EventEmitter2, Channel, MusicVideo, Library } from '../../modules'
import * as LocalSocket from './LocalSocket' // 5004
import * as MMLocalSocket from './MMLocalSocket' // 8765
import * as WebSocket from './WebSocket' // 5002
import * as MMWebSocket from './MMWebSocket' // 9000
import * as RokuSocket from './RokuSocket'
import { freemem as _freemem, totalmem as _totalmem, uptime as _uptime, loadavg as _loadavg } from 'os';

export class Sockets {
	static localSocketConnections = new Array<SocketConnection>();
	static rokuConnections = new Array<SocketConnection>();
	static WebSocketConnections = new Array<SocketConnection>();

	// static controllerSocketEvent : EventEmitter2 = new EventEmitter2({})
	static init() {

		setInterval(function () {
			const status = {
				class: 'serverStatus',
				msgType: 'serverStatus',
				data: {
					app: { },
					system: {
						freemem: _freemem(),
						totalmem: _totalmem(),
						uptime: _uptime(),
						loadavg: _loadavg(),
						epoch: Date.now()
					},
					webSockets : WebSocket.clientSockets
				}
			};
			WebSocket.Multicast(status)
			LocalSocket.Multicast(status);
		}, 500)

		LocalSocket.LocalSocketEvent.on("connection", (ip: string) => { this.localSocketConnections.push(new SocketConnection(ip)) });
		WebSocket.WebSocketEvent.on("connection", (ip: string) => { this.localSocketConnections.push(new SocketConnection(ip)) });
		LocalSocket.LocalSocketEvent.on("msg", (msg: any) => {WebSocket.Multicast(msg)});
		WebSocket.WebSocketEvent.on("msg", (msg: any) => {LocalSocket.Multicast(msg)});
		RokuSocket.event.on("msg", (msg: any) => { console.log(msg); });
		nginxEvent.on("*", (msg: any) => LocalSocket.Multicast(msg));
		websiteEvent.on("*", (msg: any) => LocalSocket.Multicast(msg));

		MMLocalSocket.LocalSocketEvent.on("msg", (msg: any) => { MMWebSocket.Multicast(msg); });
		MMWebSocket.WebSocketEvent.on("msg", (msg: any) => { MMLocalSocket.Multicast(msg); });

	}
}

class SocketConnection{

	DataRx = 0
	DataTx = 0
	constructor(ip: string) {
		
	}
}