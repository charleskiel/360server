import { Auth, utils, request, Mysql, moment, DownloadFile, SocketCommands, EventEmitter2, _ } from '../modules';

let controllerEvent = new EventEmitter2();

export class Controller {
	static controllers: [Controller];
	static recMsg(msg: any, socket: any): any {
		if (!msg.reqId || msg.reqId === "") return { reqId: msg.reqId, res: "Invalid Request" }
		switch (msg.type) {
			case 'login':
				if (!this.controllers[msg.regtoken]) {
					if (msg.role == 'controller' && Auth.controllerTokens.includes(msg.regtoken)) {
						this.controllers[msg.regtoken] = new Controller(socket);
						return {reqId: msg.reqId, res: "OK"}
					} else {
						return {reqId: msg.reqId, res: "Invalid Token"}
					}
				}
				break;
			case 'info':
				//msg['msgId': utils.genId()]
				break;
		}
	}

	static sendToAll(msg: any, requireResponse = false) {
		//console.log(msg)
		_.map(Controller.controllers, (con: any) => {
			//console.log(con)
			con.socket.send(JSON.stringify({
				...(requireResponse ? { reqId: utils.genId() } : { msgId: utils.genId() }),
				...msg
			}));
		});
	}


	role: Controller.Role;
	viewing: boolean = false;

	constructor(public socket: any) {
		this.role =  Controller.Role.Controller
	}
	
}


export namespace Controller {
	export enum Role {
		Controller,
		Remote,
		Observer
	}
	
}