import {Mysql, Runlog, nginxEvent, RokuAPI, Library, API } from '../modules'
import express from 'express'
import http from 'http';
import { rest } from 'lodash';
import { resourceLimits } from 'worker_threads';

const httpApp = express()
const httpPort = 5000

export class HTTP {

	static init(){
		httpApp.set('trust proxy', true);
		httpApp.use(function (req, res, next) {
			const data = {
				type: "Log",
				service: "Site",
				data: {
					url: decodeURI(req.originalUrl),
					params: JSON.stringify(req.params),
					query: JSON.stringify(req.query),
					path: req.path,
					ip: req.headers['x-forwarded-for']
				}
			};
			console.log(JSON.stringify(`${req.headers['X-Real-IP'] } ::: [${req.method}] --------> ${data.data.url}`));

			//Mysql.query(`INSERT INTO sitelog (url,params,query,path,ip,timestamp) VALUES ('${data.data.url}','${data.data.params}','${data.data.query}','${data.data.path}','${data.data.ip}', now());`)
			
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		})
		httpApp.use(express.json());
		httpApp.use(express.urlencoded({ extended: true }));
		httpApp.use('/', express.static('/var/www/360tv.net'));

		httpApp.post('/api/v1/runlogPost', (req, res) => { res.send(JSON.stringify(Runlog.post(req.query),undefined, 5));})

		httpApp.all('/api/v1/roku/*', (req, res) => {
			RokuAPI.call(req)
				.then(result => {
					if (result.length > 0) {
						
						res.status(200)
						res.send(JSON.stringify(result, undefined, 4));
					} else { 
						res.status(500);
						res.send(JSON.stringify(result, undefined, 4));
					}
				})
				.catch(err => {
					res.send(JSON.stringify(err, undefined, 4));

			})
		});
		
		
		httpApp.get('/api/v1/nowPlaying', (req, res) => {
			Runlog.nowPlaying(req.query.channel).then((result) => {
				res.set('Cache-control', `public, max-age=5`)
				res.send(JSON.stringify(result, undefined, 4));
			});
		});
		httpApp.get('/api/v1/videos', (req, res) => { res.send(JSON.stringify(Library.getVideosJson(), undefined, 4)); });
		httpApp.get('/api/v1/youtube/video', (req, res) => { API.youtubeVideoLookup(req.query.id).then(result => res.send(JSON.stringify(result, undefined, 4))) });
		httpApp.get('/api/v1/findRecordLabel', (req, res) => { API.findRecordLabel(req.query.term).then(result => res.send(JSON.stringify(result, undefined, 4))) });

		// httpApp.get('/nginx*', (req, res) => {websiteEvent.emit("req", data);} );
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

}
