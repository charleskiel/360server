export const request = require('request');

export  { EventEmitter2 } from 'eventemitter2';

import _ from "lodash";

import fs from 'fs';
export { fs }

import moment from 'moment';
export {moment}
export {_}
export { Content, MusicVideo } from './interfaces/content';
export { Channel } from './server/channels';
export { Runlog } from './api/runlog';
export { Mysql } from './mysql';
export { DownloadFile } from './tools/downloadFile'
export { Youtube } from './api/youtube';
export { SocketCommands } from './interfaces/socketCommands';
export { Controller } from './server/controller'
export { Auth } from '../auth/auth'
export { Vote } from './server/vote'
export { Library } from './api/library'

export namespace utils {
	export function genId() : string {
		return Math.random().toString(16).substring(2, 10).toUpperCase()
	}
}