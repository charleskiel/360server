import { MusicVideo, request, Mysql, moment, DownloadFile, SocketCommands, EventEmitter2 } from '../modules'
export { init, channelEvent }
import * as socket from './socket'

function init() { }

let channelEvent = new EventEmitter2();
let contentEvent = new EventEmitter2();
let viewEvent = new EventEmitter2();
let remoteControlEvent = new EventEmitter2();

socket.event.on("msg", (data: any) => {
	socket.sendTo({ type: "response", res: "OK", msgId: data.data.reqId }, data.socketId)
		switch (data.service) {
			case "user":
				//if (m.msgType = "login") login(m);
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