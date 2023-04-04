import moment = require('moment');
import * as sql from 'mssql';
// const Auth = require('../auth/auth.js')
// @ts-ignore
import { Auth } from '../auth/auth';

export class Sql {

	private static config = {
		database: '360',
		server: Auth.mysql.host,
		user: Auth.mysql.user,
		password: Auth.mysql.password,
		encrypt: false
	};
	
	public static init() {
		// setInterval(() => { Sql.query('select 1'); }, 30000);

	}
	
	private static readCount = 0;
	private static writeCount = 0;
	private static errorCount = 0;

	public static getStats() {
		return {
			rc: Sql.readCount,
			wc: Sql.writeCount,
			ec: Sql.errorCount,
		};
	}
	public static getReadCount() { return Sql.readCount; }
	public static getWriteCount() { return Sql.writeCount; }
	public static addReadCount() { Sql.readCount += 1; }
	public static addWriteCount() { Sql.writeCount += 1; }


	public static query(query : string){
		// let ts = Date.now();
		// console.log(query)
		// console.log(query)
		return new Promise((result, fail) => {
			sql.connect(this.config, function (err) {
				if (err) console.log(err)
				let request = new sql.Request();

				request.query(query, function (error, data) {
					
					if (error !== null) {
						Sql.errorCount += 1;
						console.log(moment(Date.now()).format(), error, query);
						fail(error);
					};
					if (data) {
						if (query.includes("select")) { Sql.addReadCount(); } else { Sql.addWriteCount(); }
						// console.log(data.rowsAffected)
						result(data);
					}
				});
			})

		});
	}

}
