import { Console } from 'console';
import { invalid } from 'moment';
import { MusicVideo, request, Mysql, moment, DownloadFile, SocketCommands, userEvent } from '../modules';


export class User {
	static users : Map<string,User> = new Map<string, User>();
	static devices = new Map();

	static login(data: any): Promise<User> {
		return new Promise((ok, fail) => {

			let u: User;
			const q = `select * from users where regtoken = '${data.regtoken}'`
			console.log(q)
			Mysql.query(`select * from users where regtoken = '${data.regtoken}'`)
			.then((results: any) => {
				u = new User(data);
				console.log(u);
			}).catch(error => {
				u = new User(data);
				console.log(`${data.regtoken} user not found`, u);
			}).finally(() => {
				User.users.set(data.regtoken, u);
				console.log(User.users)
				u ? ok(u) : fail(u);
			})
		})
	}
	
	viewing = false;
	status = "OK";
	regtoken : string;
	role : string;
	device: any;
	
	constructor(
		data: any
	) {
		this.regtoken = data.regtoken || '';
		this.role = data.role || '';
		this.device = data.device || {};
		console.log("created user", this)
	}
}
