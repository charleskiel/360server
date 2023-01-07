import { MusicVideo, request, Mysql } from './modules'

export class Log {

	public error(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.error.toString()}', '${service}', '${message}');`);}
	public warn(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.warn.toString()}', '${service}', '${message}');`);}
	public info(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.info.toString()}', '${service}', '${message}');`);}
	public http(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.http.toString()}', '${service}', '${message}');`);}
	public verbose(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.verbose.toString()}', '${service}', '${message}');`);}
	public debug(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.debug.toString()}', '${service}', '${message}');`);}
	public silly(service: string , message: string) : void  {Mysql.query(`INSERT INTO event_log (level, service, \`type\`, message) VALUES ('${Log.level.silly.toString()}', '${service}', '${message}');`);}

}

export namespace Log {
	export enum level {
		error = 0,
		warn = 1,
		info = 2,
		http = 3,
		verbose = 4,
		debug = 5,
		silly = 6
	};
}
