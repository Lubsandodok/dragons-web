import { v4 } from 'uuid';

import { App, HttpRequest, HttpResponse, WebSocket } from 'uWebSockets.js';

import { readJson } from 'utils';
import { Room, GameMethod, GameResponse } from 'room';

let rooms: {[id: string]: Room} = {};

const app = App({
}).ws('/room/join', {
    open: (ws: WebSocket) => {
        console.log('WebSocket connection opened');
    },
    message: (ws: WebSocket, message: ArrayBuffer, isBinary: boolean) => {
        const data = JSON.parse(Buffer.from(message).toString());

        if (!(data.hasOwnProperty('method') & data.hasOwnProperty('parameters'))) {
            console.log('Error. Message is not correct', data);
            return;
        }

        if (data.method === GameMethod.JOIN_ROOM) {
            const roomId = data.parameters.room_id;
            if (rooms.hasOwnProperty(roomId)) {
                const room: Room = rooms[roomId];
                const playerId = v4();
                room.addPlayer(playerId, ws);
                room.sendToOne(GameMethod.JOIN_ROOM, response);
            } else {
                console.log('Error. Room was not found', roomId);
            }
        } else if () {

        } else {

        }
    },
})
