import { moment} from './modules'
import * as mysql from 'mysql';
//const Auth = require('../auth/auth.js')
import { Auth } from '../auth/auth.js';

export class Mysql {

	private static con = mysql.createConnection({
		database: '360',
		host: Auth.mysql.host,
		user: Auth.mysql.user,
		password: Auth.mysql.password
	});
	
	public static init() {
		Mysql.con.connect();
		setInterval(() => { Mysql.query("Select 1")}, 30000)
	}
	
	private static readCount = 0;
	private static writeCount = 0;
	private static errorCount = 0;

	public static getStats() {
		return {
			rc: Mysql.readCount,
			wc: Mysql.writeCount,
			ec: Mysql.errorCount,
		};
	}
	public static getReadCount() { return Mysql.readCount; }
	public static getWriteCount() { return Mysql.writeCount; }
	public static addReadCount() { Mysql.readCount += 1; }
	public static addWriteCount() { Mysql.writeCount += 1; }


	public static query(query : string){
		//let ts = Date.now();
		return new Promise((result, fail) => {module.exports.writecount += 1;
			Mysql.con.query(query, function (error, results : any, fields) {
				if (error !== null) {
					Mysql.errorCount += 1;
					console.log(moment(Date.now()).format(), error, query);
					fail(error);
				};
				if (results) {
					if (query.includes("select")) { Mysql.addReadCount(); } else { Mysql.addWriteCount(); }
					result(results);
				}
			});
		});
	}


}