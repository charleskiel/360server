import { Sql, Runlog, nginxEvent, RokuAPI, Library, API, Channel, User, request } from '../modules'
import { DashboardAPI } from '../api/dashboard';
import express from 'express'
import http from 'http';
import { isNull, rest } from 'lodash';
import { resourceLimits } from 'worker_threads';
import { Console } from 'console';

const dns = require('dns');
const httpApp = express()
const httpPort = 5000

export class HTTP {

	static init(){
		httpApp.set('trust proxy', true);
		httpApp.use((req, res, next) => {
			HTTP.log(req, res, next);
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		})
		httpApp.use(express.json());
		httpApp.use(express.urlencoded({ extended: true }));
		httpApp.use('/', express.static('/var/www/360tv.net'));

		httpApp.get('/api/v2/videos', (req, res) => {
			Sql.query("select * from [360_development].[360].[videos] order by artist, title, altId")
				.then((result: any) => { res.json(result.recordsets[0]); })
				.catch((error: any) => { console.log(error) })
		});

		
		httpApp.get('/api/v2/nowPlaying', (req, res) => {
			Sql.query(`SELECT top 10 * FROM [360_development].[360].[runlog] left join 
			[360_development].[360].[videos] on runlog.contentid = videos.id and runlog.contentaltid = videos.altId where runlog.channel = ${req.query.channel} and runlog.contentType = 0 order by datetime desc`)
				.then((result: any) => { res.json(result.recordsets[0]); })
				.catch((error: any) => { console.log(error) })
		});
		

		
		
		
		httpApp.all('/api/v2/roku/*', (req, res) => {
			RokuAPI.call(req)
				.then(result => {
					if (result.length > 0) {
						
						res.status(200)
						res.json(result);
					} else { 
						res.status(500);
						res.json(result);
					}
				})
				.catch(err => { res.json(err); })
		});
		
		
		httpApp.all('/api/dashboard/*', (req, res) => {
			DashboardAPI.call(req)
				.then(result => {
					if (result.length > 0) {
						
						res.status(200)
						res.json(result);
					} else { 
						res.status(500);
						res.json(result);
					}
				})
				.catch(err => { res.json(err); })
		});
		
		
		httpApp.post('/api/v2/login', (req, res) => { res.json(User.login(req)); })

		httpApp.get('/nginx/connect', (req, res) => {HTTP.nginxEventEmit("connect", req); res.send("OK"); });
		httpApp.get('/nginx/on_connect', (req, res) => {HTTP.nginxEventEmit("on_connect", req); res.send("OK"); });
		httpApp.get('/nginx/on_play', (req, res) => {HTTP.nginxEventEmit("on_play", req); res.send("OK"); });
		httpApp.get('/nginx/on_publish', (req, res) => {HTTP.nginxEventEmit("on_publish", req); res.send("OK"); });
		httpApp.get('/nginx/on_done', (req, res) => {HTTP.nginxEventEmit("on_done", req); res.send("OK"); });
		httpApp.get('/nginx/on_play_done', (req, res) => {HTTP.nginxEventEmit("on_play_done", req); res.send("OK"); });
		httpApp.get('/nginx/on_publish_done', (req, res) => {HTTP.nginxEventEmit("on_publish_done", req); res.send("OK"); });
		httpApp.get('/nginx/on_record_done', (req, res) => {HTTP.nginxEventEmit("on_record_done", req); res.send("OK"); });
		httpApp.get('/nginx/on_update', (req, res) => {HTTP.nginxEventEmit("on_update", req); res.send("OK"); });

		const httpServer = http.createServer(httpApp);
		httpServer.listen(httpPort, () => {console.log('HTTP Server running on port ' + httpPort)});
	}

	static nginxEventEmit(type: string, req: any) {
		nginxEvent.emit(type, {
			type: "Log",
			service: "Nginx",
			data: {
				url: decodeURI(req.originalUrl),
				params: req.params,
				query: req.query,
				path: req.path,
				ip: req.ip
			}
		})
	}

	static log(req :any, res :any, next :any) {
		const url = decodeURI(req.originalUrl);

		if (!url.includes("channelStatus?channel")) {
			let domain: string = '';
			dns.reverse(`${req.headers['x-real-ip']}`, (err: NodeJS.ErrnoException | null, domains: string[]) => {
				if (domains?.length > 0) { domain = domains[0]; }

				const data = {
					type: "Log",
					service: "Site",
					data: {
						url: url,
						params: JSON.stringify(req.params),
						query: JSON.stringify(req.query),
						path: req.path,
						ip: req.headers['x-real-ip'],
						domain: domain
					}
				};

				console.log( Date.now(),  JSON.stringify(`${domain !== '' ? domain : req.headers['x-real-ip']} ::: [${req.method}] ---> ${data.data.url}`));
				// Sql.query(`INSERT INTO sitelog (url,params,query,path,ip,domain,timestamp) VALUES ('${data.data.url}','${data.data.params}','${data.data.query}','${data.data.path}','${req.headers['x-real-ip']}','${data.data.domain}', now());`);
			});
		}
	}
}
