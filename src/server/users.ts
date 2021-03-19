import { MusicVideo, request, Mysql, moment, DownloadFile, SocketCommands, EventEmitter2 } from './modules';
export {  };


let UserEvent = new EventEmitter2();
let users : [User] 

export class User {
	role : User.Role
	viewing: boolean = false
	
	constructor(public socket: any) {
		this.role = User.Role.User
	}
}

export class PowerUser extends User {
	constructor(public socket: any) {
		super(socket)
		this.role = User.Role.PowerUser
	}
}

export class SuperUser extends PowerUser {
	constructor(public socket: any) {
		super(socket);
		this.role = User.Role.SuperUser
	}
}

export class Admin  extends SuperUser {
	constructor(public socket: any) {
		super(socket);
		this.role = User.Role.Admin
	}
}

export namespace User {
	export enum Role {
		User,
		PowerUser,
		SuperUser,
		Admin
	}
}