import { Sql,
	Runlog,
	nginxEvent,
	RokuAPI,
	Library,
	API,
	Channel } from '../modules'
// const Auth = require('../auth/auth.js')
// @ts-ignore
import { Auth } from '../auth/auth';

export class User {
	public static Login(req: any) {
		let results : any;
		return new Promise((result, fail) => {
			
			let query = `INSERT INTO users (Name,
				FirstName,
				LastName,
				avatar,
				email,
				oAuthType,
				oAuthId,
				idToken,
				firstIssuedAt,
				expiresAt,
				expiresIn,
				regtoken) ;
			VALUES(
				'{$_POST["Name"]}',
				'{$_POST["FirstName"]}',
				'{$_POST["LastName"]}',
				'{$_POST["avatar"]}',
				'{$_POST["email"]}',
				'{$_POST["oAuthType"]}',
				'{$_POST["oAuthId"]}',
				'{$_POST["idToken"]}',
				{ $_POST["firstIssuedAt"]},
				{ $_POST["expiresAt"]},
				{ $_POST["expiresIn"]},
				'{$newtoken}')
			ON DUPLICATE KEY UPDATE
				Name = '{$_POST["Name"]}',
				FirstName = '{$_POST["FirstName"]}',
				LastName = '{$_POST["LastName"]}',
				avatar = '{$_POST["avatar"]}',
				email = '{$_POST["email"]}',
				oAuthType = '{$_POST["oAuthType"]}',
				oAuthId = '{$_POST["oAuthId"]}',
				idToken = '{$_POST["idToken"]}',
				firstIssuedAt = { $_POST["firstIssuedAt"]},
				expiresAt = { $_POST["expiresAt"]},
				expiresIn = { $_POST["expiresIn"] },
				oAuthType = '{$_POST["oAuthType"]}',
				oAuthID = '{$_POST["oAuthId"]}',
				lastlogin = now(); `;
			console.log(query);
			console.log(req);
			var newtoken = "360B";
			newtoken += Math.floor(Math.random() * 9999).toString().padStart(4, '0');
			newtoken += Math.floor(Math.random() * 9999).toString().padStart(4, '0');
			Sql.query(query)
				.then((data: any) => { results = data.recordsets; })
				.catch((error: any) => { console.log(error); });
			console.log(results)	
			Sql.query(`select * from users where idToken = ${req.idToken}`)
			
			.then((records: any) => { results = records.recordsets; })
				.catch((error: any) => { console.log(error); })
			
			console.table(results)
			result(results)
		}

	
	}
}
