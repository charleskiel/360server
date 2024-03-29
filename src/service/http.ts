import { Sql, Runlog, nginxEvent, RokuAPI, Library, API, Channel, User, request , WebSocketClient} from '../modules'
import { DashboardAPI } from '../api/dashboard';
import express from 'express'
import http from 'http';
import { isNull, rest } from 'lodash';
import { resourceLimits } from 'worker_threads';
import { Console } from 'console';
const cors = require('cors');
const geoip = require('geoip-lite');

const dns = require('dns');
const httpApp = express()
const httpPort = 5000



export class HTTP {
	static domainLocations = new Map();

	static init(){
		httpApp.set('trust proxy', true);
		httpApp.use(cors());

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
			Sql.query("select * from videos order by artist, title, altId")
				.then((result: any) => { res.json(result); })
				.catch((error: any) => { console.log(error) })
		});

		
		httpApp.get('/api/v2/nowPlaying', (req, res) => {
			Sql.query(`SELECT * FROM runlog left join videos on runlog.contentid = videos.id and runlog.contentaltid = videos.altId where runlog.channel = ${req.query.channel} and runlog.contentType = 0 order by datetime desc limit 10`)
				.then((result: any) => { res.json(result); })
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
				.catch(err => {
					console.log(err);
					 res.json(err); })
		});
		
		
		httpApp.all('/api/dashboard/*', (req, res) => {
			// console.log(req)
			DashboardAPI.call(req)
				.then(result => {
					res.status(200)
					res.json(result);
				})
				.catch(err => { res.json(err); })
		});
		
		
		httpApp.post('/api/v2/login', (req, res) => { res.json(User.login(req)); })
		httpApp.post('/api/v2/googleLogin', (req, res) => { res.json(User.googleLogin(req)); })

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
		const ingoreUrls = [
			"channelStatus?channel",
			"api/dashboard/viewers"
		]

		if (!url.includes("channelStatus?channel") && !url.includes("api/dashboard/") && !JSON.stringify(req.headers['x-real-ip']).includes("192.168.1.") ) {
			let domain: string = '';
			// console.log(req.headers['x-real-ip']);
			if (req.headers['x-real-ip']) dns.reverse(`${req.headers['x-real-ip']}`, (err: NodeJS.ErrnoException | null, domains: string[]) => {
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

				console.log(Date.now(), JSON.stringify(`${domain !== '' ? domain : req.headers['x-real-ip']} ::: [${req.method}] ---> ${data.data.url}`));
				if (!this.domainLocations.has(req.headers['x-real-ip'])) {
					this.domainLocations.set(req.headers['x-real-ip'], geoip.lookup(req.headers['x-real-ip']))
					this.domainLocations.set(req.headers['x-real-ip'], geoip.lookup(req.headers['x-real-ip']))
					// console.log(this.domainLocations.get(req.headers['x-real-ip']))
					console.log(this.domainLocations)
				}
				WebSocketClient.Send(JSON.stringify(`${domain !== '' ? domain : req.headers['x-real-ip']} ::: [${req.method}] ---> ${data.data.url}`));
				// Sql.query(`INSERT INTO sitelog (url,params,query,path,ip,domain,timestamp) VALUES ('${data.data.url}','${data.data.params}','${data.data.query}','${data.data.path}','${req.headers['x-real-ip']}','${data.data.domain}', now());`);
			});
		}
	}
}
