import moment = require('moment');
import * as mysql from 'mysql';
//const Auth = require('./auth/auth.js')
// @ts-ignore
import { Auth } from '../auth/auth.js';

export class Sql {
	private static con = mysql.createConnection({
		database: '360_development',
		host: Auth.mysql.host,
		user: Auth.mysql.user,
		password: Auth.mysql.password,
		multipleStatements: true
	});

	public static init(enabled = true) {
		Sql.enabled = enabled;
		if (enabled) setInterval(() => {
			Sql.query('select 1');
		}, 30000);
	}
	private static enabled = true;

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


	public static query(query: string) {
		// let ts = Date.now();
		// console.log(query)
		// console.log(query)
		return new Promise((result, fail) => {
			module.exports.writecount += 1;
			if (Sql.enabled && !query.includes("INSERT ON DUPLICATE")) Sql.con.query(query, function (error, results: any, fields) {

				if (error !== null) {
					Sql.errorCount += 1;
					console.log(moment(Date.now()).format(), error, query);
					fail(error);
				};
				if (results) {
					if (query.includes("select")) { Sql.addReadCount(); } else { Sql.addWriteCount(); }
					result(results);
				}
			});
		});
		
	}

	public static end() {
		Sql.con.end();
	}

	public static connect() {
		Sql.con.connect();
	}
}
