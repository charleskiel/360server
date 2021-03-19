import { MusicVideo, request, Mysql, Youtube, Runlog, Channel, EventEmitter2, Controller} from './modules'
import express from 'express';
import {channelEvent} from './socket/sockets'
import { Library } from './api/library';

export { webEvent}
const socket = require('./socket/sockets')
const app = express();
const port = 8001;


Library.load()
socket.init()

let webEvent = new EventEmitter2();

app.use(function (req, res, next) {
	//console.log(req)
	Controller.sendToAll({
		type: "info",
		service: "web",
		url: new URLSearchParams(req.originalUrl)
	});

	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/', express.static('./site/'));
// app.get('/users/:userId/books/:bookId', function (req, res) {
//   res.send(req.params)
// })

app.get('/api/v1/nowplaying', (req, res) => { res.send(JSON.stringify(Runlog.nowPlaying(), undefined, 4)) });
app.get('/api/v1/youtube/video', (req, res) => { Youtube.videoLookup(req.query.id).then(result => res.send(JSON.stringify(result, undefined, 4)))});

app.get('/nginx_connect', (req, res) => { console.log(""); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });


app.get('/nginx_on_connect', (req, res) => { console.log("connect"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_play', (req, res) => { console.log("play"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_publish', (req, res) => { console.log("publish"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_done', (req, res) => { console.log("done"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_play_done', (req, res) => { console.log("play_done"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_publish_done', (req, res) => { console.log("publish_done"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_record_done', (req, res) => { console.log("record_done"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });
app.get('/nginx_on_update', (req, res) => { console.log("update"); console.log(new URLSearchParams(req.originalUrl)); res.send("OK"); });


channelEvent.on("channel", (msg: any) => { Channel.tickHandler(msg)})

app.listen(port, () => {
	return console.log(`server is listening on ${port}`);
});
