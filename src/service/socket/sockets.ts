import {nginxEvent, websiteEvent, User, channelEvent, contentEvent, EventEmitter2, Channel } from '../../modules'
import * as controllerSocket from './controllerSocket' // 5004
import * as remoteSocket from './remoteSocket' // 5002
import * as rokuSocket from './rokuSocket'
import { freemem as _freemem, totalmem as _totalmem, uptime as _uptime, loadavg as _loadavg } from 'os';

export class Sockets {
	static controllerConnections = Object.create(null);
	static rokuConnections = Object.create(null);
	static remoteConnections = Object.create(null);

	// static controllerSocketEvent : EventEmitter2 = new EventEmitter2({})
	static init() {

		setInterval(function () {
			const status = {
				class: 'serverStatus',
				msgType: 'serverStatus',
				data: {
					app: {
					},
					system: {
						freemem: _freemem(),
						totalmem: _totalmem(),
						uptime: _uptime(),
						loadavg: _loadavg(),
						epoch: Date.now()
					}
				}
			};

			//event.emit("serverStatus", status)
			controllerSocket.sendTo(status);
			remoteSocket.sendToRemotes(status)

		}, 500)


		controllerSocket.event.on("msg", (msg: any) => {
			console.log(JSON.stringify(msg));
			// socket.sendTo({ type: "response", res: "OK", msgId: data.data.reqId }, data.socketId)
			switch (msg.data.service) {
				case "user":
					switch (msg.msgType) { case "login": User.login(msg); break; }
					break;
				case "admin":
					channelEvent.emit(msg.data.service, msg);
					break;
				case "content":
					contentEvent.emit(msg.data.service, msg);
					Channel.tickHandler(msg);
					break;
				case "channel":
					channelEvent.emit(msg.data.service, msg);
					Channel.tickHandler(msg.data);
					break;
				default:
					break;
			}
			remoteSocket.sendToRemotes(msg.data)
		});

		remoteSocket.event.on("msg", (m: any) => {
			console.log(m.msg);
			//socket.sendTo({ type: "response", res: "OK", msgId: m.data.reqId }, m.socketId)
			switch (m.msg.class) {
				case "user":
					switch (m.msg.msgType) {
						case "login":
							User.login(m.msg.data).then(result => {
								console.log("user", result);
								m.socket.send(JSON.stringify({ msgType: m.msg.msgType, class: m.msg.class, data: result} ));
							}).catch(error => {
								console.log("error getting user" , error)
							});
							break;
					}
					break;
				default:
					controllerSocket.sendTo(m.msg)

					break;
			}
		});

		rokuSocket.event.on("msg", (msg: any) => {
			console.log(msg);
			//socket.sendTo({ type: "response", res: "OK", msgId: msg.data.reqId }, msg.socketId)
			switch (msg.class) {
				case "user":
					switch (msg.msgType) { case "login": User.login(msg); break; }
					break;
				case "nowPlayingStatus":
					break;
				case "nowPlayingList":
					break;
				case "remoteControl":
					break;
				case "command":
					break;
				default:
					break;
			}
		});

		nginxEvent.on("*", (msg: any) => controllerSocket.sendTo(msg));
		websiteEvent.on("*", (msg: any) => controllerSocket.sendTo(msg));

	}


	
}
