import { v4 } from 'uuid';

import { App, HttpRequest, HttpResponse, WebSocket } from 'uWebSockets.js';

import { readJson } from './utils';

type Player = {
    id: string,
    ws: WebSocket,
    event: string,
};

type Room = {
    id: string,
    players: {[id: string]: Player},
};

let store: {rooms: {[id: string]: Room}} = {
    rooms: {},
};

function handleMessage(data: any, ws: WebSocket) {
    if (data.type === 'join') {
        const roomId = data.room_id;
        const playerId = v4();
        store.rooms[roomId].players[playerId] = {id: playerId, ws: ws, event: ''};
        ws.roomId = roomId;
        ws.playerId = playerId;

        const allPlayerIds = Object.keys(store.rooms[roomId].players);
        for (const playerIdToSend of allPlayerIds) {
            const wsToSend = store.rooms[roomId].players[playerIdToSend].ws;
            wsToSend.send(JSON.stringify({type: 'join', players: allPlayerIds, your_player_id: playerIdToSend}));
        }
        console.log('Joined room with id', roomId, 'Player id: ', playerId);
    } else if (data.type === 'event') {
        const roomId = ws.roomId;
        const playerId = ws.playerId;
        store.rooms[roomId].players[playerId].event = data.event;
        console.log('Got event', data.event, 'for player', playerId, 'in room', roomId);
    }
}

const app = App({
}).ws('/room/join', {
    open: (ws: WebSocket) => {
        console.log('WebSocket connection opened');
    },
    message: (ws, message, isBinary) => {
        console.log(`Got message: ${message}`);
        const data = JSON.parse(Buffer.from(message).toString());
        handleMessage(data, ws);
    },
    close: (ws: WebSocket) => {
        console.log('WebSocket connection closed');
        const roomId = ws.roomId;
        const playerId = ws.playerId;
        delete store.rooms[roomId].players[playerId];
    }
}).post('/room/create', (res: HttpResponse, req: HttpRequest) => {
    console.log('Request:', req);
    const url = req.getUrl();

    readJson(res, (obj: any) => {
        console.log('Posted to ' + url + ': ');
        const roomId = v4();
        store.rooms[roomId] = {id: roomId, players: {}};
        res.end(JSON.stringify({'room_id': roomId}));
        console.log('Created room with id: ' + roomId);
    }, () => {
        console.log('Invalid JSON');
    });

    res.onAborted(() => {
        console.log('Request aborted');
    });
}).post('/http/room/join', (res: HttpResponse, req: HttpRequest) => {
    console.log('RequestToJoin:', req);

    readJson(res, (obj: any) => {
        console.log('Posted to ', obj);
        if (!obj.hasOwnProperty('room_id')) {
            console.log('Request body doesnt have room_id');
            res.end(JSON.stringify({'error': 'Doesnt have a room_id'}));
        }

        const room_id = obj.room_id;
        if (store.rooms.hasOwnProperty(room_id)) {
            const room = store.rooms.room_id;
            console.log('Joined');
            res.end(JSON.stringify({'result': 'You have successfully joined'}));
        } else {
            console.log('Doesnt have a room like that');
            res.end(JSON.stringify({'error': 'Doesnt have a room like that'}));
        }
    }, () => {
        console.log('Invalid JSON');
    });
}).listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});


setInterval(() => {
    for (let roomId in store.rooms) {
        const room = store.rooms[roomId];
        for (let playerId in room.players) {
            const player = room.players[playerId];
            let eventsToSend: {[id: string]: string} = {};
            for (let anotherPlayerId in room.players) {
                const anotherPlayer = room.players[anotherPlayerId];
//                if (playerId !== anotherPlayerId) {
                if (anotherPlayer.event !== '') {
                    eventsToSend[anotherPlayerId] = anotherPlayer.event;
                }
//                }
            }
            player.ws.send(JSON.stringify({type: 'event', players: eventsToSend}));
        }

        // delete events from players
        for (let playerId in room.players) {
            const player = room.players[playerId];
            player.event = '';
        }

        console.log('Sent events to players in room', roomId, 'players:', Object.keys(room.players));
    }
}, 33);
