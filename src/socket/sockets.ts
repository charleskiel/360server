import {nginxEvent, websiteEvent, User, channelEvent } from '../modules'
import * as controllerSocket from './controllerSocket'
import * as remoteSocket from './remoteSocket'

export { init }

function init() { }

controllerSocket.event.on("msg", (data: any) => {
	console.log(data)
	//socket.sendTo({ type: "response", res: "OK", msgId: data.data.reqId }, data.socketId)
	switch (data.service) {
		case "user":
			switch (data.msgType) {
				case "login": User.login(data); break;
			}
			break;
		case "admin":
			channelEvent.emit(data.service,data)
			break;
		case "contentController":
			break;
		case "channel":
			channelEvent.emit(data.service, data)
			break;
		case "contentController":
			break;
		case "contentController":
			break;
		case "contentController":
			break;
		case "contentController":
			break;
		default:
			break;
		}
})

remoteSocket.event.on("msg", (data: any) => {
	console.log(data)
	//socket.sendTo({ type: "response", res: "OK", msgId: data.data.reqId }, data.socketId)
	switch (data.service) {
		case "user":
			switch (data.msgType) {
				case "login": User.login(data); break;
			}
			break;
		case "nowPlayingStatus":
			break;
		case "nowPlayingList":
			break;
		case "remoteControll":
			break;
		case "command":
			break;
		default:
			break;
	}
})

nginxEvent.on("*", (msg : any) => controllerSocket.sendTo(msg))
websiteEvent.on("*", (msg : any) => controllerSocket.sendTo(msg))