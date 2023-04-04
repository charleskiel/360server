import { v4 as uuid } from 'uuid';
import { Console } from 'console';
import { invalid } from 'moment';
import { MusicVideo, request, Sql, moment, DownloadFile, SocketCommands, userEvent } from '../modules';


export class User {
	static users : Map<string,User> = new Map<string, User>();
	static devices = new Map();

	static login(data: any): Promise<User> {
		return new Promise((ok, fail) => {

			let u: User;
			const q = `select * from [360_development].[360].[users] where regtoken = '${data.regtoken}'`
			console.log(q)
			Sql.query(`select * from [360_development].[360].[users] where regtoken = '${data.regtoken}'`)
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
	
	static googleLogin(data: any): Promise<any> {
		return new Promise((ok, fail) => {
			const sqlResults = {};
			const q = `INSERT INTO users (Name,FirstName,LastName,avatar,email,oAuthType,oAuthId,idToken,firstIssuedAt,expiresAt,expiresIn,regtoken,lastlogin)
				VALUES(
					'${data["Name"]}',
					'${data["FirstName"]}',
					'${data["LastName"]}',
					'${data["avatar"]}',
					'${data["email"]}',
					'${data["oAuthType"]}',
					'${data["oAuthId"]}',
					'${data["idToken"]}',
					'${data["firstIssuedAt"]},
					'${data["expiresAt"]},
					'${data["expiresIn"]},
					'${uuid()}',
					now())

				ON DUPLICATE KEY UPDATE
					Name = '${data["Name"]}',
					FirstName = '${data["FirstName"]}',
					LastName = '${data["LastName"]}',
					avatar = '${data["avatar"]}',
					email = '${data["email"]}',
					oAuthType = '${data["oAuthType"]}',
					oAuthId = '${data["oAuthId"]}',
					idToken = '${data["idToken"]}',
					firstIssuedAt = '${data["firstIssuedAt"]},
					expiresAt = '${data["expiresAt"]},
					expiresIn = '${data["expiresIn"] },
					oAuthType = '${data["oAuthType"]}',
					oAuthID = '${data["oAuthId"]}',
					lastlogin = now(); `
				
			Sql.query(q).then(() => {
				const qq = `select * from [360_development].[360].[users] where idToken = '${data["idToken"]}'`;
				Sql.query(qq)
					.then((results: any) => { ok(results); })
					.catch(error => { fail(`${error}`); })
					.finally(() => { console.log(User.users); });
			})
		})
			
	}

	viewing = false;
	status = "OK";
	regtoken : string;
	role : string;
	device: any;
	
	constructor( data: any ) {
		this.regtoken = data.regtoken || '';
		this.role = data.role || '';
		this.device = data.device || {};
		console.log("created user", this)
	}
}
