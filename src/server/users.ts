import { v4 as uuid } from 'uuid';
import { Console } from 'console';
import { invalid } from 'moment';
import { MusicVideo, request, Sql, moment, DownloadFile, SocketCommands, userEvent } from '../modules';
import { result } from 'lodash';


export class User {
	static users : Map<string,User> = new Map<string, User>();
	static devices = new Map();

	static login(post: any): Promise<any> {
		console.log(post)
		let regcode = this.generateCode();
		Sql.query(`INSERT INTO devices (
		DeviceID,
		AppVersion,
		regkey,
		partner,
		DeviceTypeName,
		DeviceModel,
		DeviceDisplayType,
		DeviceDisplayMode,
		DeviceCountryCode,
		DeviceTimeZoneName,
		DeviceAudio,
		AddDate,
		LastActive
		)
		VALUES
		(
			'${post.device.deviceuniqueid}',
			'${post.device.appversion}',
			'${regcode}',
			'Roku',
			'${post.device.friendlyname}',
			'${post.device.model}',
			'${post.device.displaytype}',
			'${post.device.videomode}',
			'${post.device.locale}',
			'${post.device.timezone}',
			'${post.device.audiooutputchannel}',
			now(),
			now()
			)
		
			ON DUPLICATE KEY UPDATE

			lastactive = now()
			`)



		if (post.regtoken !== '') {
			return new Promise((ok, fail) => {
				let u: User;
				const q = `select * from users where regtoken = '${post.regtoken}'`
				console.log(q)
				Sql.query(q).then((results: any) => {
					
					ok(results[0]);
				}).catch(error => {
					u = new User(post);
					console.log(`${post.regtoken} user not found`, u);
				}).finally(() => {
					User.users.set(post.regtoken, u);
					console.log(User.users)
					u ? ok(u) : fail(u);
				})
			})
		}
		else{
			return new Promise((ok, fail) => {
				let u: User;
				const q = `select *, '${regcode}' as regcode from users where regtoken = '000000000000'`
				console.log(q)
				Sql.query(q)
				.then((results: any) => {
					ok(results[0]);
				}).catch(error => {
					u = new User(post);
					console.log(`${post.regtoken} user not found`, u);
				})
			})
		}

		
	}
	// static login(post: any): Promise<User> {
	// 	console.log(post)
	// 	return new Promise((ok, fail) => {
	// 		let u: User;
	// 		const q = `select * from users where regtoken = '${post.regtoken}'`
	// 		console.log(q)
	// 		Sql.query(q)
	// 		.then((results: any) => {
	// 			u = new User(results[0]);
	// 			console.log(u);
	// 		}).catch(error => {
	// 			u = new User(post);
	// 			console.log(`${post.regtoken} user not found`, u);
	// 		}).finally(() => {
	// 			User.users.set(post.regtoken, u);
	// 			console.log(User.users)
	// 			u ? ok(u) : fail(u);
	// 		})
	// 	})
	// }

	static generateCode() {
		const characters = '2346789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding easily confused characters
		let code = '';
	   
		for (let i = 0; i < 6; i++) {
		  const randomIndex = Math.floor(Math.random() * characters.length);
		  code += characters[randomIndex];
		}
	   
		return code;
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
	
	static googleLogin(post: any): Promise<any> {

		let body = post.body

		return new Promise((ok, fail) => {
			const sqlResults = {};
			const q = `INSERT INTO users (Name,FirstName,LastName,avatar,email,oAuthType,oAuthId,idToken,firstIssuedAt,expiresAt,expiresIn,regtoken,lastlogin)
				VALUES(
					'${body["Name"]}',
					'${body["FirstName"]}',
					'${body["LastName"]}',
					'${body["avatar"]}',
					'${body["email"]}',
					'${body["oAuthType"]}',
					'${body["oAuthId"]}',
					'${body["idToken"]}',
					'${body["firstIssuedAt"]}',
					'${body["expiresAt"]}',
					'${body["expiresIn"]}',
					'${uuid()}',
					now())

				ON DUPLICATE KEY UPDATE
					Name = '${body["Name"]}',
					FirstName = '${body["FirstName"]}',
					LastName = '${body["LastName"]}',
					avatar = '${body["avatar"]}',
					email = '${body["email"]}',
					oAuthType = '${body["oAuthType"]}',
					oAuthId = '${body["oAuthId"]}',
					idToken = '${body["idToken"]}',
					firstIssuedAt = '${body["firstIssuedAt"]}',
					expiresAt = '${body["expiresAt"]}',
					expiresIn = '${body["expiresIn"]}',
					oAuthType = '${body["oAuthType"]}',
					oAuthID = '${body["oAuthId"]}',
					lastlogin = now(); `
				
			Sql.query(q).then((results: any) => {
				
				console.log(results)

				const qq = `select * from users where idToken = '${body["idToken"]}'`;
				Sql.query(qq)
					.then((results: any) => { console.log(results[0]);  ok(results[0]); })
					.catch(error => { fail(`${error}`); })
					.finally(() => { console.log(User.users); });
			})
		})
			
	}
}
