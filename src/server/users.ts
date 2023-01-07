import { MusicVideo, request, Mysql, moment, DownloadFile, SocketCommands, userEvent } from '../modules';


export class User {
	static users = new Map()

	static login(data: any) {
		let u: User
		User.users.set(data.regtoken, new User(data.regtoken, data.role, data._class, data.socket))
	}
	viewing: boolean = false

	constructor(
		public regtoken: string,
		public role: string,
		public _class: string,
		public socket: any,
	) {}
}
