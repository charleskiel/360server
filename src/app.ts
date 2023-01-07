import { Mysql, Channel, channelEvent, HTTP, Sockets, Library} from './modules'

console.clear();
Library.load();
//Runlog.load();
Mysql.init();
HTTP.init();
Sockets.init();

channelEvent.on("channel", (msg: any) => { Channel.tickHandler(msg)});
