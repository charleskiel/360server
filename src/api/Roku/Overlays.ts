import {
    MusicVideo, request, Mysql, moment, DownloadFile, User, Channel, Sockets, Content, Runlog, LogEntry, Library
} from '../../modules'
import { Auth } from '../../auth/auth.js';
import { toUpper } from 'lodash';
import {inherits, log} from 'util';
import { Socket } from 'socket.io';

export class RokuAPI {

    public static generateOverlays(overlayType: string) : Array<any> {
        const overlays = [];
        // console.log(overlayType.toUpperCase())
        switch (overlayType.toUpperCase()) {
            case '360':
                overlays.push({
                    type: "poster",
                    x: 0, y: 0,
                    uri: "https://www.360tv.net/roku/theme/overlays/360.png"
                });
                break;

            case 'LATE':
                overlays.push({
                    type: "poster",
                    x: 0, y: 0,
                    uri: "https://www.360tv.net/roku/theme/overlays/LATE.png"
                });
                break;
            case 'WEEKEND':
                overlays.push({
                    type: "poster",
                    x: 0, y: 0,
                    uri: "https://www.360tv.net/roku/theme/overlays/WEEKEND.png"
                });
                break;

            case 'VOTE':
                break;

            case 'W':
                overlays.push({
                    type: "poster",
                    x: 0, y: 0,
                    uri: "https://www.360tv.net/roku/theme/overlays/360.E.png",
                });
                break;

            default:
                overlays.push({
                    type: "poster", x: 0, y: 0,
                    uri: "https://www.360tv.net/roku/theme/overlays/360.png"
                });
                break;
        }
        // console.log(overlays)
        return overlays;
    }

}

interface Overlay {
    x : number
    y: number
    type : string
}

interface Label extends Overlay {
    text: string
    width: number
    height : number
}
interface Poster extends Overlay {
    uri: string
}
