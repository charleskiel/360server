export const request = require('request');
import { EventEmitter2 } from 'eventemitter2'
import moment = require('moment')
import _ = require('lodash')
export { EventEmitter2 } from 'eventemitter2'
export { Content, MusicVideo, Bump, Break, Card, Song, Intro } from './interfaces/content';
export { Channel } from './server/channels';
export { Runlog } from './service/runlog';
export { Mysql } from './mysql';
export { DownloadFile } from './tools/downloadFile'
export { API} from './api/functions';
export { SocketCommands} from './interfaces/socketCommands';
export { Controller } from './service/socket/controller'
export { Auth } from './auth/auth'
export { Vote } from './service/vote'
export { Library } from './service/library'
export { User } from './service/users'
export { RokuAPI } from './api/roku'
export { HTTP } from './service/http'
export { Sockets } from './service/socket/sockets'

const websiteEvent = new EventEmitter2({ wildcard: true });
const nginxEvent = new EventEmitter2({ wildcard: true });
const controllerEvent = new EventEmitter2({ wildcard: true });
const userEvent = new EventEmitter2({ wildcard: true });
const channelEvent = new EventEmitter2({ wildcard: true });
const contentEvent = new EventEmitter2({ wildcard: true });
const viewEvent = new EventEmitter2({ wildcard: true });
const remoteControlEvent = new EventEmitter2({ wildcard: true });
export { websiteEvent, nginxEvent,controllerEvent, userEvent, channelEvent,contentEvent,viewEvent,remoteControlEvent,moment, _ }

export namespace utils {
	export function genId() : string {
		return Math.random().toString(16).substring(2, 10).toUpperCase()
	}
}
