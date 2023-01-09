import { v4 } from 'uuid';

import { App, HttpRequest, HttpResponse, WebSocket } from 'uWebSockets.js';

import { readJson } from './utils';
import {
    Room,
    GameMethod,
    JoinRoomResponse,
    PlayerWasJoinedResponse,
    PlayerEventWasSentResponse,
} from './room';

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
                ws.roomId = roomId;
                ws.playerId = playerId;
                const joinRoom: JoinRoomResponse = {your_player: playerId};
                room.sendToOne(GameMethod.JOIN_ROOM, joinRoom, playerId, true);

                const isGamePlaying = room.getGamePlaying();
                const playerWasJoined: PlayerWasJoinedResponse = {
                    players: room.getCurrentJoinedPlayers(),
                    is_game_playing: isGamePlaying,
                };
                room.sendToAll(GameMethod.PLAYER_WAS_JOINED, playerWasJoined);
                room.setGamePlaying(isGamePlaying);
                console.log('Joined with id:', playerId);
            } else {
                console.log('Error. Room was not found', roomId);
            }
        } else if (data.method === GameMethod.SEND_PLAYER_EVENT) {
            const playerId = ws.playerId;
            const room = rooms[ws.roomId];

            // Add validation
            const event = data.parameters.event;
            room.setPlayerEvent(playerId, event);
            console.log('Player event was received:', playerId, event);
        }
        else if (data.method === GameMethod.FINISH_ROOM) {
            // TODO: Later
        } else {
            console.log('Error. Unknown method');
        }
    },
    close: (ws: WebSocket, code: number, message: ArrayBuffer) => {
        console.log('WebSocket connection closed');
        const room = rooms[ws.roomId];
        const playerId = ws.playerId;
        room.removePlayer(playerId);
    },
}).post('/room/create', (res: HttpResponse, req: HttpRequest) => {
    console.log('Request:', req);
    const url = req.getUrl();

    readJson(res, (obj: any) => {
        console.log('Posted to', obj);
        const roomId = v4();
        rooms[roomId] = new Room(roomId, obj.expected_player_count);
        res.end(JSON.stringify({'room_id': roomId}));
        console.log('Created room with id: ' + roomId);
    }, () => {
        console.log('Invalid JSON');
    });

    res.onAborted(() => {
        console.log('Request aborted');
    });
}).listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});


setInterval(() => {
    for (let roomId in rooms) {
        const room = rooms[roomId];
        if (room.getGamePlaying()) {
            const messageToSend: PlayerEventWasSentResponse = {players: room.getAllCurrentEvents()};
            room.sendToAll(GameMethod.PLAYER_EVENT_WAS_SENT, messageToSend);
            room.clearAllCurrentEvents();
        }
    }
}, 33);
