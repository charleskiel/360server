import _ = require('lodash');
import {Library} from '../modules'
var votes = []

export class Vote {

	
	ballots = [];
	
	cast = (DeviceID: any, videoId : number) => {
		console.log(this.ballots[DeviceID]);
		let sendVoteCount = [0, 0, 0];
		if (this.ballots[DeviceID]) {
			//console.log(`${DeviceID}:: CHANGED VOTE to ${MusicVideos(module.exports.status.modeSelections.list[voteSelection]).Artist} - ${MusicVideos(module.exports.status.modeSelections.list[voteSelection]).Title}`);
		} else {
			//console.log(`${DeviceID}:: VOTED FOR to ${MusicVideos(module.exports.status.modeSelections.list[voteSelection]).Artist} - ${Library .videos(module.exports.status.modeSelections.list[voteSelection]).Title}`);
		}
		module.exports.status.modeSelections.votes = [];

		//this.ballots[DeviceID] = voteSelection;

		for (let i = 0; i < module.exports.status.modeSelections.list.length - 1; i++) {
			module.exports.status.modeSelections.details[i].votes = 0;
		}
		_.values(this.ballots).map(_value => {
			module.exports.status.modeSelections.details[_value].votes += 1;
			sendVoteCount[_value] += 1;
		});
		console.log(sendVoteCount);
		console.log(module.exports.status.modeSelections.details);

		//this.sendTo({ messageType: "votes", data: sendVoteCount });


	};
}

